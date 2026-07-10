const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

// Load env vars
dotenv.config();

const products = [
    // Laptops
    {
        name: "AeroBook X1",
        segment: "Laptop",
        price: 74999,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
        description: "Slim performance laptop with a vivid display, fast charging, and all-day battery life.",
        stock: 15,
        rating: 4.8,
        reviews: 24,
    },
    {
        name: "Zenith Pro 16",
        segment: "Laptop",
        price: 112999,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        description: "High-end powerhouse laptop built for video editing, 3D rendering, and hardcore gaming.",
        stock: 8,
        rating: 4.9,
        reviews: 67,
    },
    {
        name: "CloudBook Lite",
        segment: "Laptop",
        price: 34999,
        image: "/images/cloudbook_lite.png",
        description: "Lightweight and affordable. Perfect for students and basic everyday tasks.",
        stock: 35,
        rating: 4.3,
        reviews: 112,
    },
    {
        name: "Quantum UltraBook",
        segment: "Laptop",
        price: 89999,
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=900&q=80",
        description: "Ultra-thin design with edge-to-edge OLED display and an incredibly fast processor.",
        stock: 12,
        rating: 4.7,
        reviews: 43,
    },

    // Watches
    {
        name: "Pulse Watch S",
        segment: "Watch",
        price: 18999,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
        description: "Smartwatch with fitness tracking, call alerts, and an elegant AMOLED display.",
        stock: 50,
        rating: 4.6,
        reviews: 18,
    },
    {
        name: "Titan Active S2",
        segment: "Watch",
        price: 24999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        description: "Rugged smartwatch for extreme sports with GPS, altimeter, and waterproof build.",
        stock: 22,
        rating: 4.8,
        reviews: 91,
    },
    {
        name: "Lumina Classic",
        segment: "Watch",
        price: 12999,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80",
        description: "Classic analog look with modern smart features hidden underneath.",
        stock: 45,
        rating: 4.4,
        reviews: 32,
    },

    // Mobiles
    {
        name: "Nova Phone Pro",
        segment: "Mobile",
        price: 69999,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        description: "Premium smartphone with sharp cameras, smooth performance, and a bright edge-to-edge display.",
        stock: 10,
        rating: 4.9,
        reviews: 142,
    },
    {
        name: "Nova Phone Lite",
        segment: "Mobile",
        price: 29999,
        image: "/images/nova_phone_lite.png",
        description: "Budget-friendly option that doesn't compromise on battery life or essential features.",
        stock: 60,
        rating: 4.5,
        reviews: 205,
    },
    {
        name: "Galaxy Fold X",
        segment: "Mobile",
        price: 139999,
        image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=900&q=80",
        description: "The future is foldable. Expand your screen to tablet size in a second.",
        stock: 5,
        rating: 4.8,
        reviews: 58,
    },
    {
        name: "PixelLens 5",
        segment: "Mobile",
        price: 54999,
        image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80",
        description: "The ultimate camera phone with AI-powered computational photography.",
        stock: 25,
        rating: 4.7,
        reviews: 89,
    },

    // Audio
    {
        name: "SonicBuds Air",
        segment: "Audio",
        price: 9999,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
        description: "True wireless earbuds with active noise cancellation and crystal clear calling.",
        stock: 100,
        rating: 4.5,
        reviews: 89,
    },
    {
        name: "OrbitSound Mini",
        segment: "Audio",
        price: 7999,
        image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80",
        description: "Compact wireless speaker with rich bass, long battery life, and modern styling.",
        stock: 30,
        rating: 4.4,
        reviews: 12,
    },
    {
        name: "Studio Pro Over-Ear",
        segment: "Audio",
        price: 24999,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=80",
        description: "Professional grade over-ear headphones with studio quality sound and memory foam cups.",
        stock: 18,
        rating: 4.9,
        reviews: 134,
    },
    {
        name: "BassBeat Boombox",
        segment: "Audio",
        price: 15999,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
        description: "Massive sound for parties, complete with RGB lighting synced to your music.",
        stock: 15,
        rating: 4.6,
        reviews: 44,
    },

    // Tablets
    {
        name: "Vision Tab 11",
        segment: "Tablet",
        price: 32999,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
        description: "Portable tablet built for streaming, sketching, reading, and work on the go.",
        stock: 25,
        rating: 4.7,
        reviews: 53,
    },
    {
        name: "Vision Tab Pro",
        segment: "Tablet",
        price: 64999,
        image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80",
        description: "Laptop-replacement tablet featuring an M-class chip, beautiful display, and magnetic stylus support.",
        stock: 14,
        rating: 4.9,
        reviews: 82,
    },
    
    // Accessories
    {
        name: "ChargePad Wireless",
        segment: "Accessories",
        price: 2999,
        image: "/images/chargepad_wireless.png",
        description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
        stock: 150,
        rating: 4.3,
        reviews: 215,
    },
    {
        name: "MechKey RGB Keyboard",
        segment: "Accessories",
        price: 6499,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
        description: "Mechanical gaming keyboard with customizable RGB lighting and tactile blue switches.",
        stock: 40,
        rating: 4.8,
        reviews: 104,
    },
    {
        name: "ErgoMouse Pro",
        segment: "Accessories",
        price: 4999,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
        description: "Ergonomic wireless mouse designed to reduce wrist strain during long sessions.",
        stock: 75,
        rating: 4.6,
        reviews: 77,
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected for seeding");

        // Clear existing products to prevent duplicates during seeding
        await Product.deleteMany();
        console.log("🧹 Cleared existing products");

        // Insert new products
        await Product.insertMany(products);
        console.log(`🌱 ${products.length} products seeded successfully!`);

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedProducts();
