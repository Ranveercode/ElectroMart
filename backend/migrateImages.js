const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Ensure media folder exists
const mediaDir = path.join(__dirname, "media");
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
}

// Check for valid Cloudinary configuration
const isConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'your_cloud_secret';

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn("⚠️  WARNING: Cloudinary credentials not fully configured in .env!");
    console.warn("Script will only download images to the 'media' folder and will skip the Cloudinary upload.");
    console.warn("Please add them to your .env file and run this script again to complete the migration.");
    console.log("-------------------------------------------------------------------------------------");
}

const Product = require("./src/models/Product");

const downloadImage = async (url, localPath) => {
    try {
        if (url.startsWith("http")) {
            const res = await fetch(url);
            const buffer = await res.buffer();
            fs.writeFileSync(localPath, buffer);
            return true;
        } else {
            // It's a local file in frontend (e.g. /images/cloudbook_lite.png)
            const frontendPath = path.join(__dirname, "../frontend/public", url);
            if (fs.existsSync(frontendPath)) {
                fs.copyFileSync(frontendPath, localPath);
                return true;
            }
            console.error(`Local file not found: ${frontendPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
        return false;
    }
};

const runMigration = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        for (const product of products) {
            if (!product.image || product.image.includes("cloudinary.com")) {
                console.log(`Skipping ${product.name} (Already migrated or no image)`);
                continue;
            }

            console.log(`Processing: ${product.name}`);
            
            // Clean up name for file saving
            const safeName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = product.image.includes('.png') ? '.png' : '.jpg';
            const localFilePath = path.join(mediaDir, `${safeName}${extension}`);

            // 1. Download to media folder
            console.log(`   Downloading image to media/${safeName}${extension}...`);
            const downloaded = await downloadImage(product.image, localFilePath);

            if (!downloaded) {
                console.log(`   ❌ Failed to get image for ${product.name}`);
                continue;
            }

            // 2. Upload to Cloudinary (if configured)
            if (isConfigured) {
                console.log(`   Uploading to Cloudinary...`);
                try {
                    const result = await cloudinary.uploader.upload(localFilePath, {
                        folder: "electromart_products",
                        public_id: safeName
                    });

                    // 3. Update DB
                    product.image = result.secure_url;
                    await product.save();
                    console.log(`   ✅ Successfully updated DB with Cloudinary URL: ${result.secure_url}`);
                } catch (err) {
                    console.error(`   ❌ Cloudinary upload failed:`, err.message);
                }
            } else {
                console.log(`   ✅ Downloaded locally. Skipping Cloudinary upload (missing credentials).`);
            }
        }

        console.log("\nMigration script finished successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration script failed:", error);
        process.exit(1);
    }
};

runMigration();
