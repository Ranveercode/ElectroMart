const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const Product = require("../../backend/src/models/Product");
const User = require("../../backend/src/models/User");
const Order = require("../../backend/src/models/Order");

/**
 * Creates all shopping tools bound to a specific userId.
 * LangGraph's ToolNode will auto-dispatch to these by name.
 */
function createShopTools(userId) {
    const searchProducts = new DynamicStructuredTool({
        name: "search_products",
        description:
            "Search for products in the store catalog by name, description, or category. Always use this FIRST before add_to_cart to get the real MongoDB product ID.",
        schema: z.object({
            query: z
                .string()
                .describe("Search term like 'laptop', 'smartphone', 'wireless'"),
            category: z
                .string()
                .optional()
                .describe("Product segment/category, e.g., 'Laptop', 'Mobile', 'Audio', 'Watch', 'Tablet', 'Accessories'"),
        }),
        func: async ({ query, category }) => {
            const filter = {};
            if (query) {
                filter.$or = [
                    { name: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ];
            }
            if (category) {
                filter.segment = { $regex: category, $options: "i" };
            }
            const products = await Product.find(filter).limit(5);
            if (products.length === 0) {
                return JSON.stringify({ results: [], message: "No products found." });
            }
            return JSON.stringify(
                products.map((p) => ({
                    id: p._id,
                    name: p.name,
                    price: p.price,
                    segment: p.segment,
                    stock: p.stock,
                }))
            );
        },
    });

    const getCart = new DynamicStructuredTool({
        name: "get_cart",
        description: "View the current items in the user's shopping cart.",
        schema: z.object({}),
        func: async () => {
            const user = await User.findById(userId).populate("cart.product");
            if (!user || !user.cart || user.cart.length === 0) {
                return JSON.stringify({ items: [], message: "Cart is empty." });
            }
            return JSON.stringify(
                user.cart.map((item) => ({
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                }))
            );
        },
    });

    const addToCart = new DynamicStructuredTool({
        name: "add_to_cart",
        description:
            "Add a product to the user's cart. You MUST call search_products first to get the exact MongoDB _id. Never guess or fabricate an ID.",
        schema: z.object({
            productId: z
                .string()
                .describe("The exact 24-character MongoDB _id of the product"),
            quantity: z
                .number()
                .default(1)
                .describe("Number of items to add (default 1)"),
        }),
        func: async ({ productId, quantity }) => {
            if (!productId || productId.length !== 24) {
                return JSON.stringify({
                    error: "Invalid product ID. Search for the product first to get a valid 24-character MongoDB ID.",
                });
            }
            const product = await Product.findById(productId);
            if (!product) {
                return JSON.stringify({ error: "Product not found with that ID." });
            }
            const user = await User.findById(userId);
            const existingItem = user.cart.find(
                (c) => c.product.toString() === productId
            );
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                user.cart.push({ product: productId, quantity });
            }
            await user.save();
            return JSON.stringify({
                success: true,
                message: `Added ${quantity} × ${product.name} to cart.`,
            });
        },
    });

    const removeFromCart = new DynamicStructuredTool({
        name: "remove_from_cart",
        description:
            "Remove a product from the user's cart. Use get_cart first to see what's in the cart and get the productId.",
        schema: z.object({
            productId: z
                .string()
                .describe("The exact 24-character MongoDB _id of the product to remove"),
        }),
        func: async ({ productId }) => {
            const user = await User.findById(userId);
            const itemIndex = user.cart.findIndex(
                (c) => c.product.toString() === productId
            );
            if (itemIndex === -1) {
                return JSON.stringify({
                    error: "This product is not in your cart.",
                });
            }
            const removedName = productId; // We'll get the name separately
            user.cart.splice(itemIndex, 1);
            await user.save();

            // Get product name for a friendly response
            const product = await Product.findById(productId);
            const name = product ? product.name : "the product";
            return JSON.stringify({
                success: true,
                message: `Removed ${name} from cart.`,
            });
        },
    });

    const checkout = new DynamicStructuredTool({
        name: "checkout",
        description:
            "Place an order using the items currently in the user's cart. Ask the user for shipping address details and payment method before calling this.",
        schema: z.object({
            address: z.string().describe("Shipping street address"),
            city: z.string().describe("City name"),
            postalCode: z.string().describe("Postal/ZIP code"),
            country: z.string().describe("Country name"),
            paymentMethod: z
                .enum(["Cash On Delivery", "PayPal", "Credit Card"])
                .describe("Payment method"),
        }),
        func: async ({ address, city, postalCode, country, paymentMethod }) => {
            const user = await User.findById(userId).populate("cart.product");
            if (!user.cart || user.cart.length === 0) {
                return JSON.stringify({ error: "Cart is empty. Add products first." });
            }

            const itemsPrice = user.cart.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
            );
            const shippingPrice = itemsPrice > 500 ? 0 : 50;
            const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
            const totalPrice = itemsPrice + shippingPrice + taxPrice;

            const orderItems = user.cart.map((item) => ({
                name: item.product.name,
                qty: item.quantity,
                image: item.product.image,
                price: item.product.price,
                product: item.product._id,
            }));

            const order = new Order({
                user: userId,
                orderItems,
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();
            user.cart = [];
            await user.save();

            // Prepare Email HTML
            const itemsHtml = orderItems.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
                </tr>
            `).join("");

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center;">
                        <h2>Order Confirmation</h2>
                        <p>Thank you for your purchase at ElectroMart!</p>
                    </div>
                    <div style="padding: 20px;">
                        <h3>Hi ${user.firstName},</h3>
                        <p>Your order <strong>#${createdOrder._id}</strong> has been placed successfully via our AI Assistant.</p>
                        
                        <h4>Order Details:</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; text-align: right;">
                            <p><strong>Subtotal:</strong> ₹${itemsPrice}</p>
                            <p><strong>Shipping:</strong> ₹${shippingPrice}</p>
                            <p><strong>Tax:</strong> ₹${taxPrice}</p>
                            <h3 style="color: #1a1a2e;">Total: ₹${totalPrice}</h3>
                        </div>

                        <h4>Shipping Address:</h4>
                        <p>${shippingAddress.address}, ${shippingAddress.city}<br/>
                        ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
                    </div>
                </div>
            `;

            // Need to require sendEmail at the top or locally
            const sendEmail = require("../../backend/src/utils/sendEmail");
            sendEmail({
                email: user.email,
                subject: `Order Confirmation - ElectroMart (#${createdOrder._id})`,
                html: htmlContent
            });

            return JSON.stringify({
                success: true,
                message: "Order placed successfully!",
                orderId: createdOrder._id,
                totalPaid: totalPrice,
            });
        },
    });

    return [searchProducts, getCart, addToCart, removeFromCart, checkout];
}

module.exports = { createShopTools };
