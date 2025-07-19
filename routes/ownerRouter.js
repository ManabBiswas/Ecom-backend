const express = require("express");
const router = express.Router();
const ownerModel = require("../models/ownermodels");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

// Admin route - renders create product page
router.get("/admin", (req, res) => {
    // Get flash messages
    const messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    
    // Debug logging
    console.log("Flash messages:", messages);
    
    res.render("createProduct", { messages });
});

// Create Owner (Only one owner allowed)
router.post("/create", async (req, res) => {
    try {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            return res.status(403).json({
                success: false,
                message: "Owner already exists. You do not have permission to create another owner"
            });
        }

        let { fullName, email, password, gstno } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !gstno) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create owner
        let createdOwner = await ownerModel.create({
            fullName,
            email,
            password: hashedPassword,
            gstno
        });

        // Generate JWT token
        const token = jwt.sign(
            { email: createdOwner.email, ownerId: createdOwner._id, role: 'owner' }, 
            process.env.JWT_KEY || 'fallback-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log("Owner created successfully:", createdOwner.fullName);
        res.status(201).json({
            success: true,
            message: "Owner created successfully",
            owner: {
                id: createdOwner._id,
                fullName: createdOwner.fullName,
                email: createdOwner.email,
                gstno: createdOwner.gstno
            }
        });

    } catch (err) {
        console.error("Owner creation error:", err.message);
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Owner Login
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Find owner
        let owner = await ownerModel.findOne({ email: email });
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: owner.email, ownerId: owner._id, role: 'owner' }, 
            process.env.JWT_KEY || 'fallback-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log("Owner logged in successfully:", owner.fullName);
        res.status(200).json({
            success: true,
            message: "Login successful",
            owner: {
                id: owner._id,
                fullName: owner.fullName,
                email: owner.email,
                gstno: owner.gstno
            }
        });

    } catch (err) {
        console.error("Owner login error:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
});

// Owner Logout
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
});

module.exports = router;