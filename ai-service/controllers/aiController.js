const { HumanMessage, SystemMessage, AIMessage } = require("@langchain/core/messages");
const { createAgentGraph, SYSTEM_PROMPT } = require("../graph/agentGraph");
const ChatHistory = require("../../backend/src/models/ChatHistory");

/**
 * POST /api/ai/chat
 * Handles a user chat message through the LangGraph agentic workflow.
 * Loads last 5 messages from MongoDB for context continuity.
 */
const handleChat = async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.user._id;

        // Get the latest user message (last message in the array)
        const userMessages = messages.filter((m) => m.role === "user");
        const latestUserMessage = userMessages[userMessages.length - 1]?.content;

        if (!latestUserMessage) {
            return res.status(400).json({ message: "No user message provided." });
        }

        // --- Load last 5 messages from MongoDB for memory ---
        const history = await ChatHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Reverse to chronological order (oldest first)
        history.reverse();

        // Build LangGraph message array: System → History → Current
        const graphMessages = [new SystemMessage(SYSTEM_PROMPT)];

        // Add historical messages
        for (const msg of history) {
            if (msg.role === "user") {
                graphMessages.push(new HumanMessage(msg.content));
            } else if (msg.role === "assistant") {
                graphMessages.push(new AIMessage(msg.content));
            }
        }

        // Add the current user message
        graphMessages.push(new HumanMessage(latestUserMessage));

        // --- Invoke the LangGraph Agent ---
        const agent = createAgentGraph(userId);
        const result = await agent.invoke(
            { messages: graphMessages },
            { recursionLimit: 10 }
        );

        // Extract the final AI response (last message that has text content)
        const resultMessages = result.messages;
        let finalResponse = "Sorry, I couldn't process your request.";

        for (let i = resultMessages.length - 1; i >= 0; i--) {
            const msg = resultMessages[i];
            if (msg.content && typeof msg.content === "string" && msg.content.trim()) {
                // Skip tool result messages
                if (msg._getType && msg._getType() === "tool") continue;
                finalResponse = msg.content;
                break;
            }
        }

        // --- Save to MongoDB for future memory ---
        await ChatHistory.create([
            { user: userId, role: "user", content: latestUserMessage },
            { user: userId, role: "assistant", content: finalResponse },
        ]);

        res.json({ message: finalResponse });
    } catch (error) {
        console.error("AI Agent Error:", error);
        res.status(500).json({ message: "AI Error: " + error.message });
    }
};

/**
 * GET /api/ai/history
 * Returns the last 5 messages for the logged-in user.
 */
const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await ChatHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Reverse to chronological order
        history.reverse();

        const messages = history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        res.json({ messages });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to load chat history." });
    }
};

module.exports = { handleChat, getChatHistory };
