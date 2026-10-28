const app = require('../src/app');
const mongoose = require('mongoose');
require('dotenv').config();

// Cache the connection promise so it's reused across warm invocations
let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is missing on Vercel");
    }
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    }
    await connectionPromise;
    console.log("✅ MongoDB connected (Vercel Serverless)");
}

// Wrap the Express app so MongoDB connects BEFORE handling any request
module.exports = async (req, res) => {
    // 1. Immediately handle preflight OPTIONS requests without waiting for MongoDB
    if (req.method === 'OPTIONS') {
        return app(req, res);
    }

    // 2. Connect to MongoDB for normal requests
    try {
        await connectDB();
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        // Include CORS headers so browser shows the actual error instead of a CORS block
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        return res.status(500).json({ 
            message: "Database connection failed", 
            error: err.message 
        });
    }
    return app(req, res);
};
