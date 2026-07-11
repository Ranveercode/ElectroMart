const { StateGraph, MessagesAnnotation, END, START } = require("@langchain/langgraph");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { ChatGroq } = require("@langchain/groq");
const { createShopTools } = require("../tools/shopTools");

const SYSTEM_PROMPT = `You are a helpful, professional AI shopping assistant for ElectroMart — an online electronics store.

Your capabilities:
- Search for products in the catalog
- View, add to, and remove items from the user's cart
- Place orders (checkout)

Rules:
1. ALWAYS search for a product first before adding it to cart. Never guess a product ID.
2. When removing from cart, first call get_cart to see what's there and get the correct productId.
3. Keep responses concise and friendly.
4. After completing an action, confirm what you did in plain language and STOP calling tools.
5. If the user asks something unrelated to shopping, politely redirect them.
6. Format prices in ₹ (Indian Rupees).`;

/**
 * Creates and compiles a LangGraph agent for a specific user.
 * Each request gets its own graph instance bound to the user's ID.
 */
function createAgentGraph(userId) {
    const tools = createShopTools(userId);

    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        maxRetries: 2,
    }).bindTools(tools);

    // --- Node: Agent (LLM reasoning) ---
    async function agentNode(state) {
        const response = await model.invoke(state.messages);
        return { messages: [response] };
    }

    // --- Node: Tool Execution (auto-dispatches) ---
    const toolNode = new ToolNode(tools);

    // --- Conditional Edge: should we continue to tools or end? ---
    function shouldContinue(state) {
        const lastMessage = state.messages[state.messages.length - 1];

        // If the LLM made tool calls, route to the tool node
        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools";
        }
        // Otherwise, we're done
        return END;
    }

    // --- Build the Graph ---
    const graph = new StateGraph(MessagesAnnotation)
        .addNode("agent", agentNode)
        .addNode("tools", toolNode)
        .addEdge(START, "agent")
        .addConditionalEdges("agent", shouldContinue, {
            tools: "tools",
            [END]: END,
        })
        .addEdge("tools", "agent");

    // Compile and return
    return graph.compile();
}

module.exports = { createAgentGraph, SYSTEM_PROMPT };
