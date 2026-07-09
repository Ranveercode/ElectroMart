const express = require("express");
const { handleChat } = require("../controllers/aiController");
const { protect } = require("../../backend/src/middlewares/authMiddleware");

const router = express.Router();

router.post("/chat", protect, handleChat);

module.exports = router;
