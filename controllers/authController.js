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
            req.flash('error', 'User already exists with this email. Please Login');
            return res.redirect('/');
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

        // Clear any existing cookie first
        res.clearCookie('token');

        // Set cookie with explicit settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to false for development (localhost)
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        req.flash('success', 'Registration successful! Welcome to ShopHub!');
        res.redirect('/shop');
    } catch (err) {
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/');
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Find user
        let user = await userModel.findOne({ email: email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/');
        }

        // Generate JWT token using utility
        const token = generateToken(user);

        // Clear any existing cookie first
        res.clearCookie('token');

        // Set cookie with explicit settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to false for development (localhost)
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        req.flash('success', 'Login successful! Welcome back!');
        res.redirect('/shop');
    } catch (err) {
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/');
    }
};