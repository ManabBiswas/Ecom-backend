const express = require("express");
const router = express.Router();
// const userModel = require('../models/usermodels');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const config = require('config');
const registerUser = require('../controllers/authController').registerUser;


// Test route
router.get("/", (req, res) => {
    res.send("user route is working now!");
});

// User Registration
router.post("/register", registerUser ); // extra space after registerUser

// User Login
// const generateToken = require('../utils/generateToken').generateToken;

// router.post("/login", async (req, res) => {
//     try {
//         let { email, password } = req.body;

//         // Find user
//         let user = await userModel.findOne({ email: email });
//         if (!user) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "Invalid email or password" 
//             });
//         }

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "Invalid email or password" 
//             });
//         }

//         // Generate JWT token using utility
//         const token = generateToken(user);

//         // Set cookie
//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 24 * 60 * 60 * 1000 // 24 hours
//         });

//         console.log("User logged in successfully:", user.fullName);
//         res.status(200).json({ 
//             success: true, 
//             message: "Login successful",
//             user: {
//                 id: user._id,
//                 fullName: user.fullName,
//                 email: user.email,
//                 location: user.location,
//                 contactNo: user.contactNo
//             }
//         });

//     } catch (err) {
//         console.error("Login error:", err.message);
//         res.status(500).json({ 
//             success: false, 
//             message: "Internal server error during login" 
//         });
//     }
// });

// User Logout
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ 
        success: true, 
        message: "Logout successful" 
    });
});

module.exports = router;