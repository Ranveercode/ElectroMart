const OpenAI = require("openai");
const Product = require("../../backend/src/models/Product");
const User = require("../../backend/src/models/User");
const Order = require("../../backend/src/models/Order");

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

        // Extract JWT token from cookie
        const token = req.cookies.jwt || "";

        // Extract the last user message and the conversation history
        if (!messages || messages.length === 0) {
            return res.status(400).json({ message: "Messages history is required." });
        }
        
        const userMessage = messages[messages.length - 1].content;
        const history = messages.slice(0, messages.length - 1);

        console.log(`Forwarding query to Python Microservice: "${userMessage}"`);

        // Forward to the Python microservice
        const response = await fetch("http://localhost:8000/api/shopping/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
                history: history,
                user_token: token
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Python microservice returned ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log("Response from Python Microservice:", data.response);
        
        // Return the response format expected by the frontend
        res.json({ 
            message: data.response,
            intent: data.intent,
            api_success: data.api_success
        });

    } catch (error) {
        console.error("AI Proxy Error:", error);
        res.status(500).json({ message: "AI Proxy Error: " + error.message });
    }
};

module.exports = { handleChat };
