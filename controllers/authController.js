const userModel = require('../models/usermodels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');

module.exports.registerUser = async (req, res) => {
    try {
        let { fullName, email, password, location, contactNo } = req.body;

        // Check if user already exists
        let existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email Please Login"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        let user = await userModel.create({
            fullName,
            email,
            password: hashedPassword,
            location,
            contactNo
        });

        // Generate JWT token
        const token = generateToken(user);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        // console.log("tokrn",token)

        console.log("User registered successfully:", user.fullName);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                location: user.location,
                contactNo: user.contactNo
            }
        });

    } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
}


module.exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Find user
        let user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email or Password is incorrect"
            });
        }

        // Generate JWT token using utility
        const token = generateToken(user);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log("User logged in successfully:", user.fullName);
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                location: user.location,
                contactNo: user.contactNo
            }
        });

    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error during login process. Please try again later."
        });
    }
}