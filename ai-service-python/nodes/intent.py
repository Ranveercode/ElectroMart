import json
from state import ShoppingState
from services.llm import llm_service
from langchain_core.messages import SystemMessage, HumanMessage

async def intent_recognition_node(state: ShoppingState) -> dict:
    """
    Analyzes the user's message along with conversation history to:
    1. Classify the user's intent.
    2. Extract entities (product name, quantity).
    """
    user_message = state.get("user_message", "")
    chat_history = state.get("chat_history", [])
    
    # Format chat history for the prompt
    history_str = ""
    for msg in chat_history[:-1]:  # exclude the last user message which is current
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"[{role}]: {msg['content']}\n"
        
    system_prompt = (
    "You are an expert intent recognition and entity extraction assistant for an electronics e-commerce store (ElectroMart).\n"
    "Your task is to analyze the user's current message, taking the conversation history into account, and classify the intent and extract entities.\n\n"

    "Supported Intents:\n"
    "1. 'product_details': The user wants information, specifications, or details about a product.\n"
    "   - Required entity: 'product_name'\n"
    "2. 'add_to_cart': The user wants to add a product to their shopping cart.\n"
    "   - Required entity: 'product_name'\n"
    "   - Optional entity: 'quantity' (integer, default to 1 if not specified)\n"
    "3. 'remove_from_cart': The user wants to remove or delete a product from their shopping cart.\n"
    "   - Required entity: 'product_name'\n"
    "   - Optional entity: 'quantity' (integer, if specified)\n"
    "4. 'checkout': The user wants to place an order / checkout their cart.\n"
    "   - No product entities required.\n"
    "5. 'unknown': Use this if the intent does not match any of the above (e.g. general greeting, chitchat, or unsupported questions).\n\n"

    "CRITICAL - CONTEXT RESOLUTION:\n"
    "If the user refers to a product using pronouns like 'it', 'that', 'this item', etc., resolve it using the conversation history.\n"
    "For example, if the user asked about 'iPhone 15' previously and now says 'Add it to my cart', the product name should be 'iPhone 15'.\n\n"

    "You must respond ONLY with a valid JSON object matching this schema:\n"
    "{{\n"
    '  "intent": "product_details" | "add_to_cart" | "remove_from_cart" | "checkout" | "unknown",\n'
    '  "entities": {{\n'
    '    "product_name": "string or null",\n'
    '    "quantity": integer or null\n'
    "  }}\n"
    "}}\n\n"

    "Do not include any other text, markdown formatting (such as ```json), or explanations. "
    "Return only the JSON object."
)
    
    user_prompt = (
        f"Conversation History:\n{history_str}\n"
        f"Current User Message: {user_message}\n"
        "JSON Response:"
    )
    
    llm = llm_service.get_llm()
    
    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        # Call Groq LLM (we will parse JSON from response.content)
        response = await llm.ainvoke(messages)
        content = response.content.strip()
        
        # Clean any markdown block formatting if present
        if content.startswith("```json"):
            content = content.replace("```json", "", 1)
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        result = json.loads(content)
        intent = result.get("intent", "unknown")
        entities = result.get("entities", {})
        
        # Default quantity if add_to_cart and quantity not specified
        if intent == "add_to_cart" and entities.get("quantity") is None:
            entities["quantity"] = 1
            
        print(f"Detected Intent: {intent}, Entities: {entities}")
        return {
            "intent": intent,
            "entities": entities
        }
    except Exception as e:
        print(f"Error in intent recognition: {e}")
        return {
            "intent": "unknown",
            "entities": {}
        }
