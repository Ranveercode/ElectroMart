const express = require("express");
const {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router
    .route("/")
    .get(protect, getCart)
    .post(protect, addToCart);

router.route("/clear").delete(protect, clearCart);
router.route("/:productId").delete(protect, removeFromCart);

module.exports = router;
