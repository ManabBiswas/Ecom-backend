const express = require("express");
const router = express.Router();
const ownerModel = require("../models/ownermodels");
const productModel = require("../models/productmodels");
const userModel = require("../models/usermodels");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const isLoggedIn = require("../middlewares/isLoggedIn");

// Login page route
router.get("/login", (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies.token) {
        return res.redirect('/owners/dashboard');
    }
    res.render("ownerLogin", {
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
});

// Registration page route
router.get("/register", (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies.token) {
        return res.redirect('/owners/dashboard');
    }
    res.render("ownerRegister", {
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
});

router.get("/admin", isLoggedIn('owner'), async (req, res) => {
    try {
        // Get flash messages
        const messages = {
            success: req.flash('success'),
            error: req.flash('error')
        };
        
        // Fetch all products to display on admin page
        const products = await productModel.find();
        
        // Convert buffer images to base64 for display
        const productsWithImages = products.map(product => {
            let imageData = null;
            if (product.image) {
                imageData = `data:image/jpeg;base64,${product.image.toString('base64')}`;
            }
            return {
                ...product.toObject(),
                image: imageData
            };
        });
        
        res.render("createProduct", { 
            messages,
            products: productsWithImages
        });
    } catch (error) {
        console.error("Error loading admin page:", error.message);
        const messages = {
            success: req.flash('success'),
            error: ['Error loading products']
        };
        res.render("createProduct", { 
            messages,
            products: []
        });
    }
});

router.get("/dashboard", isLoggedIn('owner'), async (req, res) => {
    try {
        // Check if owner is logged in
        if (!req.cookies.token) {
            return res.redirect('/owners/login');
        }

        // Verify the token and get owner info
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_KEY || 'fallback-secret');
        
        // Get owner details
        const owner = await ownerModel.findById(decoded.ownerId);
        if (!owner) {
            res.clearCookie('token');
            return res.redirect('/owners/login');
        }

        res.render("ownerDashbord", {
            owner: {
                fullName: owner.fullName,
                email: owner.email,
                gstno: owner.gstno
            },
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        req.flash('error', 'Error loading dashboard');
        res.clearCookie('token');
        res.redirect('/owners/login');
    }
});

// Get owner's products
router.get("/admin/products", isLoggedIn('owner'), async (req, res) => {
    try {
        // Check if owner is logged in
        if (!req.cookies.token) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }

        // Verify token and get owner info
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY || 'fallback-secret');
        const owner = await ownerModel.findById(decoded.ownerId);
        
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid owner'
            });
        }

        // Get all products
        const products = await productModel.find();
        
        // Convert buffer images to base64 and add additional stats
        const productsWithImages = products.map(product => {
            let imageData = null;
            if (product.image) {
                imageData = `data:image/jpeg;base64,${product.image.toString('base64')}`;
            }
            
            // Calculate product stats
            const status = parseInt(product.stock) < 10 ? 'low_stock' : 'active';
            const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);
            
            return {
                ...product.toObject(),
                image: imageData,
                status,
                discountedPrice
            };
        });

        // Calculate dashboard stats
        const stats = {
            totalProducts: products.length,
            activeProducts: productsWithImages.filter(p => p.status === 'active').length,
            lowStockProducts: productsWithImages.filter(p => p.status === 'low_stock').length,
            totalRevenue: productsWithImages.reduce((sum, p) => sum + p.price * p.soldCount, 0)
        };

        res.json({
            success: true,
            products: productsWithImages,
            stats
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
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

        // console.log("Owner created successfully:", createdOwner.fullName);
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
        let { email, password, rememberMe } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

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
            { expiresIn: rememberMe ? '30d' : '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 24 hours
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