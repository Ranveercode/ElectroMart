const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== req.params.productId.toString()
        );

        await cart.save();
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
};
