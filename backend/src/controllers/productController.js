const Product = require("../models/Product");

// @desc    Fetch all products (with optional keyword/segment filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: "i",
                  },
              }
            : {};

        const segment = req.query.segment
            ? {
                  segment: {
                      $regex: req.query.segment,
                      $options: "i",
                  },
              }
            : {};

        // Combine filters if both exist
        const filter = { ...keyword, ...segment };

        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            segment,
            stock,
        } = req.body;

        const product = new Product({
            name: name || "Sample name",
            price: price || 0,
            image: image || "https://via.placeholder.com/150",
            segment: segment || "Sample category",
            stock: stock || 0,
            description: description || "Sample description",
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            segment,
            stock,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name;
            product.price = price;
            product.description = description;
            product.image = image;
            product.segment = segment;
            product.stock = stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
