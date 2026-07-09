require("dotenv").config({ path: "d:/E-commerce/ai-ecommerce-platform/backend/.env" });
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "virat@gmail.com" });
    if (!user) {
        console.log("User not found");
        process.exit(1);
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    console.log("TOKEN=" + token);
    process.exit(0);
}
run();
