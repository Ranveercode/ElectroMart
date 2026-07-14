const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // Check Authorization header first (works on all browsers including mobile)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // Fall back to cookie (works on desktop browsers)
    if (!token) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            // Get user from the token, exclude password
            req.user = await User.findById(decoded.id).select("-password");

            if (req.user && req.user.isBanned) {
                return res.status(403).json({ message: "Your account has been banned by an administrator." });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };

