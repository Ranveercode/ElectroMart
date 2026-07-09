const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const app = require("./app");


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
    });