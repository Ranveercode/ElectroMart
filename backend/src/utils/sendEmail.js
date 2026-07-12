const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === "YOUR_APP_PASSWORD_HERE") {
            console.warn("⚠️ Email not sent: EMAIL_USER or EMAIL_PASS is missing in .env");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ElectroMart" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: " + info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = sendEmail;
