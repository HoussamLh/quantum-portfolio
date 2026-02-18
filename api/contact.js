const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Main handler for the contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, service, message, honeypot } = req.body;

    // Security: Stop bots if the hidden honeypot field is filled
    if (honeypot) return res.status(400).json({ error: "Spam detected" });

    // SMTP Configuration using SiteGround credentials from Environment Variables
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER}>`, 
            to: process.env.RECEIVER_EMAIL, 
            replyTo: email, 
            subject: `QuantumSD Inquiry: ${service}`,
            text: `Message from ${name} (${email}):\n\n${message}`
        });

        res.status(200).json({ status: "success", message: "Email sent successfully" });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
});

module.exports = app;