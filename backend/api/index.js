const app = require('../src/app');
const mongoose = require('mongoose');
require('dotenv').config();

// Cache the connection promise so it's reused across warm invocations
let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
    }
    await connectionPromise;
    console.log("✅ MongoDB connected (Vercel Serverless)");
}

// Wrap the Express app so MongoDB connects BEFORE handling any request
module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        return res.status(500).json({ message: "Database connection failed" });
    }
    return app(req, res);
};
