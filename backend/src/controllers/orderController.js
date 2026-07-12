const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            discount,
            couponCode
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        } else {
            const order = new Order({
                user: req.user._id,
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                discount,
                couponCode
            });

            const createdOrder = await order.save();

            // Prepare Email HTML
            const itemsHtml = orderItems.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
                </tr>
            `).join("");

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center;">
                        <h2>Order Confirmation</h2>
                        <p>Thank you for your purchase at ElectroMart!</p>
                    </div>
                    <div style="padding: 20px;">
                        <h3>Hi ${req.user.firstName},</h3>
                        <p>Your order <strong>#${createdOrder._id}</strong> has been placed successfully.</p>
                        
                        <h4>Order Details:</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; text-align: right;">
                            <p><strong>Subtotal:</strong> ₹${itemsPrice}</p>
                            <p><strong>Shipping:</strong> ₹${shippingPrice}</p>
                            <p><strong>Tax:</strong> ₹${taxPrice}</p>
                            <h3 style="color: #1a1a2e;">Total: ₹${totalPrice}</h3>
                        </div>

                        <h4>Shipping Address:</h4>
                        <p>${shippingAddress.address}, ${shippingAddress.city}<br/>
                        ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
                    </div>
                </div>
            `;

            // Send Email asynchronously
            sendEmail({
                email: req.user.email,
                subject: `Order Confirmation - ElectroMart (#${createdOrder._id})`,
                html: htmlContent
            });

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "firstName lastName email"
        );

        if (order) {
            // Check if user is the owner or an admin
            if (
                order.user._id.toString() === req.user._id.toString() ||
                req.user.role === "admin"
            ) {
                res.json(order);
            } else {
                res.status(403).json({ message: "Not authorized to view this order" });
            }
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "id firstName lastName");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || "Delivered";
            if (req.body.status === "Delivered") {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderToDelivered,
};
