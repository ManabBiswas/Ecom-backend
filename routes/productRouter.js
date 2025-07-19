const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const c = require("config");
// const productModel = require("../models/productmodels");

router.get("/", upload.single('image'), async (req, res) => {
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
    console.log("Product created successfully!");
    res.send(product);
});


module.exports = router;