const OpenAI = require("openai");
require("dotenv").config({ path: "d:/E-commerce/ai-ecommerce-platform/backend/.env" });
const mongoose = require("mongoose");
const Product = require("./src/models/Product");

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

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
            name: "add_to_cart",
            description: "Add a specific product to the user's shopping cart. You must provide the product ID.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string", description: "The exact MongoDB _id of the product" },
                    quantity: { type: "number", description: "Number of items to add", default: 1 }
                },
                required: ["productId", "quantity"]
            }
        }
    }
];

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Testing Groq multi-step tool calling...");
        const chatMessages = [
            { role: "system", content: "You are a shopping assistant. ALWAYS search for product IDs before adding to cart." },
            { role: "user", content: "add zenith pro 16 in cart" }
        ];

        let wantsToUseTool = true;
        
        while (wantsToUseTool) {
            console.log("Calling Groq...");
            const response = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: chatMessages,
                tools: tools,
                tool_choice: "auto",
            });
            
            const responseMessage = response.choices[0].message;
            console.log("Groq responded:", responseMessage);

            if (responseMessage.tool_calls) {
                chatMessages.push(responseMessage);
                
                for (const toolCall of responseMessage.tool_calls) {
                    console.log(`Executing tool: ${toolCall.function.name} with args ${toolCall.function.arguments}`);
                    
                    let result;
                    if (toolCall.function.name === "search_products") {
                        const args = JSON.parse(toolCall.function.arguments);
                        const products = await Product.find({ name: { $regex: args.query, $options: "i" } }).limit(5);
                        result = products.map(p => ({ id: p._id, name: p.name, price: p.price }));
                    } else if (toolCall.function.name === "add_to_cart") {
                        result = { success: true, message: "Added to cart!" };
                    }
                    
                    console.log("Tool result:", result);
                    chatMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result)
                    });
                }
            } else {
                wantsToUseTool = false;
                console.log("Final message:", responseMessage.content);
            }
        }
        
        mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e);
        mongoose.disconnect();
    }
}

test();
