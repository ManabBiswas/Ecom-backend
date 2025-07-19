const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const config = require("config");
const productModel = require("../models/productmodels");

router.post("/create", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'Please select an image file');
            return res.redirect("/owners/admin");
        }

        let { name, price, discount, bgColor, textColor, panelColor, category } = req.body;
        let product = await productModel.create({
            image: req.file.buffer,
            name,
            price,
            discount,
            bgColor,
            textColor,  
            panelColor,
            category,
        });
        
        // Set success flash message
        req.flash('success', 'Product created successfully!');
        res.redirect("/owners/admin");
        
    } catch (error) {
        console.error("Error creating product:", error.message);
        req.flash('error', error.message);
        
        // Small delay for error case too
        setTimeout(() => {
            res.redirect(req.headers.referer || '/products/create');
        }, 100);
    }
});

module.exports = router;