const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", 
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
});

// Test the connection in the Vercel logs
transporter.verify((error) => {
  if (error) {
    console.log("Transporter connection error:", error);
  } else {
    console.log("Server is ready to take messages");
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Project Inquiry from ${name} [${service}]`,
      html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #007bff;">DevbySam Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Requested Service:</strong> ${service}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Success! Your message has been sent." });
  } catch (error) {
    console.error("Vercel Mail Error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

module.exports = app;