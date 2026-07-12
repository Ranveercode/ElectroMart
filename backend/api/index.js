const app = require('../src/app');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB for Serverless Environment
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB connected (Vercel Serverless)"))
        .catch(err => console.error("❌ MongoDB connection error:", err));
}

module.exports = app;
