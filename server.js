const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Connect to MongoDB
// Update the mongoose.connect options
mongoose.connect('mongodb://localhost:27017/tuition-center', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Signup endpoint
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Update the signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check for existing user before proceeding with signup
        const existingUser = await User.findOne({
            $or: [
                { email: email, isVerified: true },
                { phone: phone, isVerified: true }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered. Please login instead.'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'This phone number is already registered. Please login instead.'
                });
            }
        }

        // If no existing verified user, proceed with signup
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user or update unverified user
        const user = await User.findOneAndUpdate(
            { $or: [{ email }, { phone }], isVerified: false },
            {
                name,
                email,
                phone,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false
            },
            { upsert: true, new: true }
        );

        // Send OTP via email
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your account',
            text: `Your OTP is: ${otp}`
        });

        res.json({ success: true, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during signup' });
    }
});

// Add/Update login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email or password incorrect' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Email or password incorrect' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your account first' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            name: user.name,
            message: 'Login successful!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

// Change the port to 4000
const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tuition-center', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

startServer();
