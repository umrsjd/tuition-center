const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Store OTP temporarily (you might want to use Redis in production)
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            isVerified: false
        });
        await user.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            // Configure your email service
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your account',
            text: `Your OTP is: ${otp}`
        });

        // Send OTP via SMS
        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        // Store OTP in session or temporary storage
        req.session.otp = otp;
        req.session.userId = user._id;

        res.json({ message: 'OTP sent successfully', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp, userId } = req.body;

        // Verify OTP
        if (otp !== req.session.otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Update user verification status
        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified: true },
            { new: true }
        );

        // Create token
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        
        // Clear session
        req.session.otp = null;
        req.session.userId = null;

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;