const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "assistant"],
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-delete messages older than 7 days
chatHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
