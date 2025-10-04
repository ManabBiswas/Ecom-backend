const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const config = require("config");
const productModel = require("../models/productmodels");
const isLoggedIn = require("../middlewares/isLoggedIn");

// Create Product Route
router.post("/create", isLoggedIn('owner'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please select an image file'
            });
        }

        let { name, description, price, stock, discount, bgColor, textColor, panelColor, category } = req.body;
        let product = await productModel.create({
            image: req.file.buffer,
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            discount: parseInt(discount) || 0,
            bgColor,
            textColor,
            panelColor,
            category,
        });
        
        // Convert the product to a plain object and add base64 image
        const productData = {
            ...product.toObject(),
            image: `data:image/jpeg;base64,${product.image.toString('base64')}`
        };

        res.json({
            success: true,
            message: 'Product created successfully!',
            product: productData
        });
        
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get product for update (renders update form with existing data)
router.get("/update/:id", isLoggedIn('owner'), async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect("/owners/admin");
        }

        // Convert buffer image to base64 for display
        let imageData = null;
        if (product.image) {
            imageData = `data:image/jpeg;base64,${product.image.toString('base64')}`;
        }

        // Get flash messages
        const messages = {
            success: req.flash('success'),
            error: req.flash('error')
        };

        // Create product object with image data for display
        const productWithImage = {
            ...product.toObject(),
            image: imageData
        };

        res.render("updateProduct", { 
            product: productWithImage,
            messages 
        });
        
    } catch (error) {
        console.error("Error fetching product for update:", error.message);
        req.flash('error', 'Error loading product for update');
        res.redirect("/owners/admin");
    }
});

// Update Product Route
router.post("/update/:id", isLoggedIn('owner'), upload.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Check if product exists
        const existingProduct = await productModel.findById(productId);
        if (!existingProduct) {
            req.flash('error', 'Product not found');
            return res.redirect("/owners/admin");
        }

        let { name, description, price, stock, discount, bgColor, textColor, panelColor, category } = req.body;
        
        // Prepare update data
        const updateData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || existingProduct.stock || 0,
            discount: parseInt(discount) || 0,
            bgColor,
            textColor,  
            panelColor,
            category,
        };

        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = req.file.buffer;
        }

        // Update the product
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update product'
            });
        }
        
        // Convert updated product image to base64
        const productData = {
            ...updatedProduct.toObject(),
            image: req.file ? 
                `data:image/jpeg;base64,${updatedProduct.image.toString('base64')}` :
                existingProduct.image
        };

        res.json({
            success: true,
            message: 'Product updated successfully!',
            product: productData
        });
        
    } catch (error) {
        console.error("Error updating product:", error.message);
        req.flash('error', `Error updating product: ${error.message}`);
        res.redirect(`/products/update/${req.params.id}`);
    }
});

// Delete Product Route
router.post("/delete/:id", isLoggedIn('owner'), async (req, res) => {
    try {
        const productId = req.params.id;
        
        const deletedProduct = await productModel.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            req.flash('error', 'Product not found');
            return res.redirect("/owners/admin");
        }
        
        req.flash('success', 'Product deleted successfully!');
        res.redirect("/owners/admin");
        
    } catch (error) {
        console.error("Error deleting product:", error.message);
        req.flash('error', `Error deleting product: ${error.message}`);
        res.redirect("/owners/admin");
    }
});

// Get all products (for display on admin page)
router.get("/", async (req, res) => {
    try {
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

        res.json({
            success: true,
            products: productsWithImages
        });
        
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching products"
        });
    }
});

// Get single product
router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Convert buffer image to base64
        let imageData = null;
        if (product.image) {
            imageData = `data:image/jpeg;base64,${product.image.toString('base64')}`;
        }

        const productWithImage = {
            ...product.toObject(),
            image: imageData
        };

        res.json({
            success: true,
            product: productWithImage
        });
        
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
});

module.exports = router;