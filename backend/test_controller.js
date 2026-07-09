require("dotenv").config({ path: "d:/E-commerce/ai-ecommerce-platform/backend/.env" });
const mongoose = require("mongoose");
const { handleChat } = require("./src/controllers/aiController");

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const req = {
            body: {
                messages: [{ role: "user", content: "add zenith pro 16 in cart" }]
            },
            user: {
                _id: "6600F0940C2717E169DDBA80" // some dummy valid user id? Wait, I need a valid user ID. 
            }
        };
        
        // Find a real user
        const User = require("./src/models/User");
        const user = await User.findOne();
        if (user) {
            req.user._id = user._id;
        } else {
            console.log("No user found.");
            return;
        }

        const res = {
            json: (data) => console.log("SUCCESS:", JSON.stringify(data)),
            status: (code) => ({
                json: (data) => console.log(`ERROR ${code}:`, JSON.stringify(data))
            })
        };

        await handleChat(req, res);

    } catch (e) {
        console.error("Script error:", e);
    } finally {
        mongoose.disconnect();
    }
}
run();
