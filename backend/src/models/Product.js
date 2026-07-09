const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        segment: {
            type: String,
            required: [true, "Product segment/category is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            default: 0,
        },
        image: {
            type: String,
            required: [true, "Product image is required"],
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
        },
        stock: {
            type: Number,
            required: true,
            default: 10,
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);
