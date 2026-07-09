const express = require("express");
const { 
    getWishlist, 
    toggleWishlist,
    getUsers,
    deleteUser,
    getUserById,
    updateUser 
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(protect, admin, getUsers);
router.route("/wishlist").get(protect, getWishlist).post(protect, toggleWishlist);
router.route("/:id")
    .get(protect, admin, getUserById)
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

module.exports = router;
