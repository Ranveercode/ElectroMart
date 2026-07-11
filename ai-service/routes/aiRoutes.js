const express = require("express");
const { handleChat, getChatHistory } = require("../controllers/aiController");
const { protect } = require("../../backend/src/middlewares/authMiddleware");

const router = express.Router();

router.post("/chat", protect, handleChat);
router.get("/history", protect, getChatHistory);

module.exports = router;
