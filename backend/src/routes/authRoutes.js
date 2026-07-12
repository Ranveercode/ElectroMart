const express = require("express");
const router = express.Router();
const { register, verifyEmail, login, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/verify", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
