import json
from state import ShoppingState
from services.backend_api import backend_api_client
from services.llm import llm_service
from langchain_core.messages import SystemMessage, HumanMessage

async def product_details_node(state: ShoppingState) -> dict:
    """
    Retrieves details for a product by searching the database catalog.
    """
    entities = state.get("entities", {})
    token=state.get("user_token", "")
    product_name = entities.get("product_name")

    if not token:
        return {
            "api_success": False,
            "api_error": "Authentication required. Please log in to manage your cart."
        }
    
    if not product_name:
        return {
            "api_success": False,
            "api_error": "Please specify the name of the product you want to find details for."
        }
        
    try:
        # products type backend se jo chahiye vohi aana chahiye 
        products = await backend_api_client.search_products(product_name)
        if not products:
            return {
                "api_success": False,
                "api_error": f"I couldn't find any product matching '{product_name}' in our store."
            }
            
        # Get the first product details
        product = products[0]
        return {
            "api_response": {
                "type": "product_details",
                "product": product
            },
            "api_success": True,
            "api_error": None
        }
    except Exception as e:
        return {
            "api_success": False,
            "api_error": f"Failed to retrieve product details: {str(e)}"
        }

async def add_to_cart_node(state: ShoppingState) -> dict:
    """
    Adds a product to the user's shopping cart.
    First searches for the product name to find its unique MongoDB ID,
    then adds it to the cart.
    """
    entities = state.get("entities", {})
    product_name = entities.get("product_name")
    quantity = entities.get("quantity", 1) or 1
    token = state.get("user_token", "")
    
    if not token:
        return {
            "api_success": False,
            "api_error": "Authentication required. Please log in to manage your cart."
        }
        
    if not product_name:
        return {
            "api_success": False,
            "api_error": "Please specify the product you want to add to your cart."
        }
        
    try:
        # Step 1: Search product to get its ID
        products = await backend_api_client.search_products(product_name)
        if not products:
            return {
                "api_success": False,
                "api_error": f"Sorry, I couldn't find a product matching '{product_name}'."
            }
            
        product = products[0]
        product_id = product["_id"]
        
        # Step 2: Add to cart
        # We need to see if item already in cart to add up quantity.
        # The backend addToCart controller:
        # const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());
        # if (itemIndex > -1) { cart.items[itemIndex].quantity = quantity; } else { cart.items.push({ product: productId, quantity }); }
        # Note: Backend REST API overrides quantity if exists.
        # Wait, if user says "Add 2 iPhones" and then "Add another one", does the quantity set to 1 or 3?
        # If the backend overrides, then we should get cart first, calculate cumulative quantity, and update.
        # Let's check backend/src/controllers/cartController.js:
        # Line 42: cart.items[itemIndex].quantity = quantity;
        # Yes, it overwrites quantity!
        # So we should get current cart, check if item exists, and set quantity to: current_qty + quantity.
        cart = await backend_api_client.get_cart(token)
        current_qty = 0
        for item in cart.get("items", []):
            prod_info = item.get("product", {})
            # product populated can be dict or just ID
            prod_id_in_cart = prod_info.get("_id") if isinstance(prod_info, dict) else prod_info
            if prod_id_in_cart == product_id:
                current_qty = item.get("quantity", 0)
                break
                
        target_quantity = current_qty + quantity
        
        updated_cart = await backend_api_client.add_to_cart(product_id, target_quantity, token)
        return {
            "api_response": {
                "type": "add_to_cart",
                "product_name": product["name"],
                "quantity": quantity,
                "cart": updated_cart
            },
            "api_success": True,
            "api_error": None
        }
    except Exception as e:
        return {
            "api_success": False,
            "api_error": f"Failed to add product to cart: {str(e)}"
        }

async def remove_from_cart_node(state: ShoppingState) -> dict:
    """
    Removes a product (or reduces its quantity) from the user's shopping cart.
    """
    entities = state.get("entities", {})
    product_name = entities.get("product_name")
    quantity_to_remove = entities.get("quantity")  # Optional quantity to reduce
    token = state.get("user_token", "")
    
    if not token:
        return {
            "api_success": False,
            "api_error": "Authentication required. Please log in to manage your cart."
        }
        
    if not product_name:
        return {
            "api_success": False,
            "api_error": "Please specify the product you want to remove from your cart."
        }
        
    try:
        # Step 1: Get user's cart
        cart = await backend_api_client.get_cart(token)
        items = cart.get("items", [])
        
        # Step 2: Find the matching product in the cart (fuzzy/substring match)
        matched_item = None
        for item in items:
            product = item.get("product")
            if not product:
                continue
            name = product.get("name", "").lower()
            segment = product.get("segment", "").lower()
            pn_lower = product_name.lower()
            
            if pn_lower in name or pn_lower in segment:
                matched_item = item
                break
                
        if not matched_item:
            return {
                "api_success": False,
                "api_error": f"I couldn't find '{product_name}' in your cart."
            }
            
        product_id = matched_item["product"]["_id"]
        product_real_name = matched_item["product"]["name"]
        current_quantity = matched_item["quantity"]
        
        # Step 3: Determine action (reduce quantity or delete)
        if quantity_to_remove and quantity_to_remove < current_quantity:
            # Reduce quantity
            new_quantity = current_quantity - quantity_to_remove
            updated_cart = await backend_api_client.add_to_cart(product_id, new_quantity, token)
            return {
                "api_response": {
                    "type": "remove_from_cart",
                    "action": "reduce",
                    "product_name": product_real_name,
                    "removed_quantity": quantity_to_remove,
                    "new_quantity": new_quantity,
                    "cart": updated_cart
                },
                "api_success": True,
                "api_error": None
            }
        else:
            # Remove completely
            updated_cart = await backend_api_client.remove_from_cart(product_id, token)
            return {
                "api_response": {
                    "type": "remove_from_cart",
                    "action": "remove",
                    "product_name": product_real_name,
                    "cart": updated_cart
                },
                "api_success": True,
                "api_error": None
            }
    except Exception as e:
        return {
            "api_success": False,
            "api_error": f"Failed to remove item from cart: {str(e)}"
        }

async def checkout_node(state: ShoppingState) -> dict:
    """
    Validates cart, prompts for missing shipping details if necessary,
    and calls the checkout API to place an order.
    """
    token = state.get("user_token", "")
    user_message = state.get("user_message", "")
    chat_history = state.get("chat_history", [])
    
    if not token:
        return {
            "api_success": False,
            "api_error": "Authentication required. Please log in to checkout."
        }
        
    try:
        # Step 1: Verify cart is not empty
        cart = await backend_api_client.get_cart(token)
        items = cart.get("items", [])
        if not items:
            return {
                "api_success": False,
                "api_error": "Your cart is empty. Please add some products to your cart before checking out."
            }
            
        # Step 2: Use LLM to extract shipping details from history + current message
        history_str = ""
        for msg in chat_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"[{role}]: {msg['content']}\n"
            
        system_prompt = (
 "You are an information extraction assistant for ElectroMart.\n"
    "Analyze the conversation history and the user's message to extract shipping and payment details.\n\n"

    "Fields to extract:\n"
    "- address: Street address (string, null if not provided)\n"
    "- city: City name (string, null if not provided)\n"
    "- postalCode: ZIP/Postal code (string, null if not provided)\n"
    "- country: Country name (string, null if not provided)\n"
    "- paymentMethod: Must be one of 'Cash On Delivery', 'PayPal', 'Credit Card'. "
    "If not specified, default to 'Cash On Delivery'.\n\n"

    "Use the conversation history to resolve missing information whenever possible. "
    "If the user previously provided an address or payment method, reuse it unless the user explicitly changes it.\n\n"

    "You must respond ONLY with a valid JSON object matching this schema:\n"
    "{{\n"
    '  "address": "string or null",\n'
    '  "city": "string or null",\n'
    '  "postalCode": "string or null",\n'
    '  "country": "string or null",\n'
    '  "paymentMethod": "Cash On Delivery" | "PayPal" | "Credit Card"\n'
    "}}\n\n"

    "Do not include any explanations, markdown formatting, or extra text. "
    "Return only the JSON object."
        )
        
        llm = llm_service.get_llm()
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Conversation:\n{history_str}\n\nJSON Output:")
        ]
        
        response = await llm.ainvoke(messages)
        content = response.content.strip()
        
        # Clean markdown wrappers if any
        if content.startswith("```json"):
            content = content.replace("```json", "", 1)
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        shipping_details = json.loads(content)
        
        # Check for missing details
        missing_fields = []
        if not shipping_details.get("address"):
            missing_fields.append("Street Address")
        if not shipping_details.get("city"):
            missing_fields.append("City")
        if not shipping_details.get("postalCode"):
            missing_fields.append("Postal Code")
        if not shipping_details.get("country"):
            missing_fields.append("Country")
            
        if missing_fields:
            missing_str = ", ".join(missing_fields)
            return {
                "api_success": False,
                # We return a specific error indicating we need details
                "api_error": f"To complete your order, please provide the following shipping details: {missing_str}."
            }
            
        # Step 3: Calculate totals
        items_price = sum(item["product"]["price"] * item["quantity"] for item in items)
        shipping_price = 0 if items_price > 500 else 50
        tax_price = round(0.18 * items_price, 2)
        total_price = items_price + shipping_price + tax_price
        
        # Formulate orderItems payload
        order_items = []
        for item in items:
            prod = item["product"]
            order_items.append({
                "name": prod["name"],
                "qty": item["quantity"],
                "image": prod.get("image", "https://via.placeholder.com/150"), # We have to get it from cloudinary 
                "price": prod["price"],
                "product": prod["_id"]
            })
            
        order_payload = {
            "orderItems": order_items,
            "shippingAddress": {
                "address": shipping_details["address"],
                "city": shipping_details["city"],
                "postalCode": shipping_details["postalCode"],
                "country": shipping_details["country"]
            },
            "paymentMethod": shipping_details["paymentMethod"],
            "itemsPrice": items_price,
            "shippingPrice": shipping_price,
            "taxPrice": tax_price,
            "totalPrice": total_price
        }
        
        # Step 4: Call backend to create order
        created_order = await backend_api_client.create_order(order_payload, token)
        
        # Step 5: Clear cart
        await backend_api_client.clear_cart(token)
        
        return {
            "api_response": {
                "type": "checkout",
                "order": created_order,
                "total_price": total_price
            },
            "api_success": True,
            "api_error": None
        }
        
    except Exception as e:
        return {
            "api_success": False,
            "api_error": f"Failed to complete checkout: {str(e)}"
        }
