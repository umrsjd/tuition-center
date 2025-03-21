require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ Error: MONGO_URI is not defined in .env file!");
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Define Schema & Model
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const FormSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    standard: { type: String, required: true }
});
const FormData = mongoose.model("FormData", FormSchema);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// **Signup Route**
app.post("/signup", async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, phone, password: hashedPassword });
        await newUser.save();

        // Send confirmation email using Resend
        try {
            const emailResponse = await resend.emails.send({
                from: "your_email@yourdomain.com", // Replace with a verified domain
                to: [email],
                subject: "Registration Successful - Vidya Study Circle",
                text: `Hello ${name},\n\nThank you for registering at Vidya Study Circle!\n\nBest regards,\nVidya Study Circle Team`,
            });
            console.log("📧 Signup Email Sent Response:", emailResponse);
        } catch (emailError) {
            console.error("❌ Error sending signup email:", emailError);
        }

        res.status(201).json({ success: true, message: "Signup successful. Email sent!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// **Login Route**
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Serve the Homepage (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// **Handle Form Submission**
app.post("/submit-form", async (req, res) => {
    try {
        const { name, email, phone, standard } = req.body;

        if (!name || !email || !phone || !standard) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newEntry = new FormData({ name, email, phone, standard });
        await newEntry.save();

        // Send email confirmation for form submission
        try {
            const emailResponse = await resend.emails.send({
                from: "umrsjd123@gmail.com", // Replace with a verified domain
                to: [email],
                subject: "Form Submission Successful - Vidya Study Circle",
                text: `Hello ${name},\n\nYour form has been successfully submitted.\n\nBest regards,\nVidya Study Circle Team`,
            });
            console.log("📧 Form Submission Email Sent Response:", emailResponse);
        } catch (emailError) {
            console.error("❌ Error sending form submission email:", emailError);
        }

        res.json({ success: true, message: "✅ Form submitted successfully!" });
    } catch (error) {
        console.error("❌ Error submitting form:", error);
        res.status(500).json({ success: false, message: "❌ Server error!" });
    }
});

// **Admin Route (View Form Submissions)**
app.get("/admin/forms", async (req, res) => {
    try {
        const entries = await FormData.find();
        res.json({ success: true, data: entries });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ success: false, message: "❌ Server error!" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
