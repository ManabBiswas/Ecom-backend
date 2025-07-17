const express = require("express");
const router = express.Router();
// const userModel = require('../models/usermodels');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const config = require('config');
const {registerUser, loginUser} = require('../controllers/authController');


// Test route
router.get("/", (req, res) => {
    res.send("user route is working now!");
});

// User Registration
router.post("/register", registerUser ); 
// User Login
// const generateToken = require('../utils/generateToken').generateToken;

router.post("/login",loginUser); 

// User Logout
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ 
        success: true, 
        message: "Logout successful" 
    });
});

module.exports = router;