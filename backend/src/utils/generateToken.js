const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "30d",
    });

    // Still set cookie for backward compatibility (works on desktop)
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return the token so it can be sent in the response body
    // (needed for mobile browsers that block third-party cookies)
    return token;
};

module.exports = generateToken;
