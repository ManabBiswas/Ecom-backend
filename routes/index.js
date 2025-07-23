const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const productmodels = require("../models/productmodels");
const usermodels = require("../models/usermodels");
const config = require("config");
const router = express.Router();

router.get("/", (req, res) => {
    let error = req.flash("error");
    let success = req.flash("success");

    res.render("index", { error, success });
});

router.get("/about", (req, res) => {
    // Render the about page
    res.render("about");;
});

// Apply authentication middleware to protected routes
router.get("/shop", isLoggedIn, async (req, res) => {
    try {
        let products = await productmodels.find();
        // console.log("Products fetched for shop:", products.length);
        res.render("shop", {
            products,
            user: req.user,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        req.flash("error", "Failed to load products");
        res.redirect("/");
    }
});

router.get("/cart", isLoggedIn, async (req, res) => {
    try {
        // Populate the user's cart with product details
        let user = await usermodels.findById(req.user._id).populate('cart');
        // console.log("Cart items fetched:", user.cart.length);
        res.render("cart", { products: user.cart, user: req.user });
    } catch (error) {
        console.error("Error fetching cart:", error);
        req.flash("error", "Failed to load cart");
        res.redirect("/");
    }
});

router.get("/addtoCart/:productId", isLoggedIn, async (req, res) => {
    try {
        // Fix: Use req.user._id instead of req.user.email
        let user = await usermodels.findById(req.user._id);
        console.log("User found for cart:", user.fullName);

        // Check if product already exists in cart
        if (!user.cart.includes(req.params.productId)) {
            user.cart.push(req.params.productId);
            await user.save();
            req.flash("success", "Product added to cart successfully!");
        } else {
            req.flash("error", "Product already in cart");
        }

        res.redirect("/shop");
    } catch (error) {
        console.error("Error adding to cart:", error);
        req.flash("error", "Failed to add product to cart");
        res.redirect("/shop");
    }
});

// Route to remove item from cart
router.get("/removeFromCart/:productId", isLoggedIn, async (req, res) => {
    try {
        let user = await usermodels.findById(req.user._id);
        user.cart = user.cart.filter(item => item.toString() !== req.params.productId);
        await user.save();
        req.flash("success", "Product removed from cart");
        res.redirect("/cart");
    } catch (error) {
        console.error("Error removing from cart:", error);
        req.flash("error", "Failed to remove product from cart");
        res.redirect("/cart");
    }
});

module.exports = router;