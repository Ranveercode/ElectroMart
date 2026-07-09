const OpenAI = require("openai");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

// Setup Groq client using OpenAI SDK
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "dummy_key",
    baseURL: "https://api.groq.com/openai/v1",
});

// Tool Definitions
const tools = [
    {
        type: "function",
        function: {
            name: "search_products",
            description: "Search for products in the store's catalog based on a query or category.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search term like 'laptop', 'smartphone', 'cheap'" },
                    category: { type: "string", description: "Product segment/category, e.g., 'Electronics', 'Home'" }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_cart",
            description: "View the current items in the user's shopping cart.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "add_to_cart",
            description: "Add a product to the user's cart. You MUST use search_products first to find the exact MongoDB productId. Do NOT call this tool simultaneously with search_products.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string", description: "The exact MongoDB _id of the product" },
                    quantity: { type: "number", description: "Number of items to add", default: 1 }
                },
                required: ["productId", "quantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "checkout",
            description: "Place an order using the items currently in the user's cart.",
            parameters: {
                type: "object",
                properties: {
                    address: { type: "string", description: "Shipping street address" },
                    city: { type: "string" },
                    postalCode: { type: "string" },
                    country: { type: "string" },
                    paymentMethod: { type: "string", enum: ["Cash On Delivery", "PayPal", "Credit Card"] }
                },
                required: ["address", "city", "postalCode", "country", "paymentMethod"]
            }
        }
    }
];

// Controller
const handleChat = async (req, res) => {
    try {
        const { messages } = req.body; // Array of chat messages
        const userId = req.user._id;

        // Ensure the system message is injected to guide Grok
        const systemMessage = {
            role: "system",
            content: "You are a helpful, professional AI shopping assistant for ElectroMart. You help users find products, add them to their cart, and checkout. You can use the provided tools to interact with the store when needed. Do not invent product IDs; search for them first. Once you have completed the user's request, reply with a friendly text confirmation and STOP using tools. Keep your responses concise."
        };

        const chatMessages = [systemMessage, ...messages];

        let wantsToUseTool = true;
        let finalMessage = "Sorry, I couldn't process your request.";
        let iterations = 0;

        while (wantsToUseTool && iterations < 5) {
            iterations++;
            
            let response;
            try {
                response = await openai.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    messages: chatMessages,
                    tools: tools,
                    tool_choice: "auto",
                });
            } catch (apiError) {
                // If Groq fails to generate valid tool calls (400 Bad Request)
                if (apiError.status === 400 && apiError.error && apiError.error.code === 'tool_use_failed') {
                    console.log("Groq tool parsing failed, retrying without tools...");
                    response = await openai.chat.completions.create({
                        model: "llama-3.1-8b-instant",
                        messages: chatMessages
                    });
                } else {
                    throw apiError;
                }
            }

            const responseMessage = response.choices[0].message;
            console.log("Iteration", iterations, "Groq response:", JSON.stringify(responseMessage, null, 2));

            if (responseMessage.tool_calls) {
                chatMessages.push(responseMessage); // Add the assistant's tool call request to the history

                // Execute all requested tools
                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    let args = {};
                    try {
                        args = JSON.parse(toolCall.function.arguments);
                    } catch (e) {
                        // ignore parse errors
                    }
                    let functionResult = null;

                    try {
                        if (functionName === "search_products") {
                            const query = {};
                            if (args.query) {
                                query.$or = [
                                    { name: { $regex: args.query, $options: "i" } },
                                    { description: { $regex: args.query, $options: "i" } }
                                ];
                            }
                            if (args.category) {
                                query.segment = { $regex: args.category, $options: "i" };
                            }
                            const products = await Product.find(query).limit(5);
                            functionResult = products.map(p => ({
                                id: p._id,
                                name: p.name,
                                price: p.price,
                                segment: p.segment,
                                stock: p.stock
                            }));
                        } 
                        else if (functionName === "get_cart") {
                            const user = await User.findById(userId).populate("cart.product");
                            functionResult = user.cart.map(item => ({
                                id: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                quantity: item.quantity
                            }));
                        } 
                        else if (functionName === "add_to_cart") {
                            // Basic validation to prevent invalid IDs
                            if (!args.productId || args.productId.includes("result from")) {
                                functionResult = { error: "You must search for the product first to get a valid 24-character MongoDB ID." };
                            } else {
                                const user = await User.findById(userId);
                                const product = await Product.findById(args.productId);
                                if (!product) {
                                    functionResult = { error: "Product not found" };
                                } else {
                                    const existingItem = user.cart.find(c => c.product.toString() === args.productId);
                                    if (existingItem) {
                                        existingItem.quantity += (args.quantity || 1);
                                    } else {
                                        user.cart.push({ product: args.productId, quantity: args.quantity || 1 });
                                    }
                                    await user.save();
                                    functionResult = { success: true, message: `Added ${args.quantity || 1} ${product.name} to cart.` };
                                }
                            }
                        } 
                        else if (functionName === "checkout") {
                            const user = await User.findById(userId).populate("cart.product");
                            if (!user.cart || user.cart.length === 0) {
                                functionResult = { error: "Cart is empty" };
                            } else {
                                // Calculate totals
                                const itemsPrice = user.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
                                const shippingPrice = itemsPrice > 500 ? 0 : 50;
                                const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
                                const totalPrice = itemsPrice + shippingPrice + taxPrice;

                                const orderItems = user.cart.map(item => ({
                                    name: item.product.name,
                                    qty: item.quantity,
                                    image: item.product.image,
                                    price: item.product.price,
                                    product: item.product._id
                                }));

                                const order = new Order({
                                    user: userId,
                                    orderItems,
                                    shippingAddress: {
                                        address: args.address,
                                        city: args.city,
                                        postalCode: args.postalCode,
                                        country: args.country
                                    },
                                    paymentMethod: args.paymentMethod,
                                    itemsPrice,
                                    taxPrice,
                                    shippingPrice,
                                    totalPrice
                                });

                                const createdOrder = await order.save();
                                
                                // Empty cart
                                user.cart = [];
                                await user.save();

                                functionResult = { 
                                    success: true, 
                                    message: "Order placed successfully!", 
                                    orderId: createdOrder._id,
                                    totalPaid: totalPrice 
                                };
                            }
                        }
                    } catch (err) {
                        functionResult = { error: err.message };
                    }

                    // Send the tool execution result back to Grok
                    chatMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(functionResult)
                    });
                }
            } else {
                wantsToUseTool = false;
                finalMessage = responseMessage.content;
                console.log("Groq final text:", finalMessage);
            }
        }

        res.json({ message: finalMessage });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI Error: " + error.message });
    }
};

module.exports = { handleChat };
