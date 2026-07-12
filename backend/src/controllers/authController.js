const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Register a new user (sends OTP)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (user && !user.isVerified) {
            // Overwrite unverified user
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = password;
            user.verificationOTP = otp;
            await user.save();
        } else {
            // Create new unverified user
            user = await User.create({
                firstName,
                lastName,
                email,
                password,
                isVerified: false,
                verificationOTP: otp,
            });
        }

        // Send OTP email
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a1a2e; text-align: center;">Verify Your Email</h2>
                <p>Hi ${firstName},</p>
                <p>Welcome to ElectroMart! Please use the following 6-digit OTP to verify your email address and activate your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; background: #f4f4f4; padding: 15px 30px; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
                </div>
                <p>This code is strictly for your use. Do not share it with anyone.</p>
                <p>Thanks,<br/>ElectroMart Team</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: "ElectroMart - Email Verification OTP",
            html: htmlContent
        });

        res.status(200).json({
            message: "Verification email sent. Please check your inbox.",
            email: user.email
        });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        if (user.verificationOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        await user.save();

        generateToken(res, user._id);

        // Send Welcome Email
        const welcomeHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a1a2e; text-align: center;">Welcome to ElectroMart!</h2>
                <p>Hi ${user.firstName},</p>
                <p><strong>Thank you for signing in to ElectroMart. Hope your shopping experience will be good!</strong></p>
                <p>Your email has been successfully verified, and your account is now fully active. Feel free to browse our latest smart gadgets, add items to your cart, and ask our AI assistant for product recommendations!</p>
                <p>Thanks,<br/>ElectroMart Team</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: "Welcome to ElectroMart! 🎉",
            html: welcomeHtml
        });

        // Send notification to Admin
        const adminNotificationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a1a2e; text-align: center;">New User Registration</h2>
                <p>Hello Admin,</p>
                <p>A new user has successfully signed up and verified their email on ElectroMart.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>First Name:</strong> ${user.firstName}</p>
                    <p><strong>Last Name:</strong> ${user.lastName}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>You can manage this user from the Admin Dashboard.</p>
            </div>
        `;

        await sendEmail({
            email: process.env.EMAIL_USER, // Send to the admin's email
            subject: "Alert: New User Registration on ElectroMart",
            html: adminNotificationHtml
        });

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email and explicitly select password
        const user = await User.findOne({ email }).select("+password");

        if (user && (await user.matchPassword(password))) {
            if (user.isBanned) {
                return res.status(403).json({ message: "Your account has been banned by an administrator." });
            }
            if (!user.isVerified) {
                return res.status(401).json({ message: "Please verify your email address first. Sign up again to receive a new OTP." });
            }

            generateToken(res, user._id);

            // Send "Thanks for signing in" Email ONLY to customers, not to admins
            if (user.role !== 'admin') {
                const loginHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #1a1a2e; text-align: center;">Welcome back to ElectroMart!</h2>
                        <p>Hi ${user.firstName},</p>
                        <p><strong>Thank you for signing in to ElectroMart. Hope your shopping experience will be good!</strong></p>
                        <p>We're glad to see you again. Feel free to browse our latest smart gadgets, add items to your cart, and ask our AI assistant for product recommendations!</p>
                        <p>Thanks,<br/>ElectroMart Team</p>
                    </div>
                `;

                await sendEmail({
                    email: user.email,
                    subject: "Thanks for signing in to ElectroMart!",
                    html: loginHtml
                });
            }

            res.status(200).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.status(200).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    getMe,
};
