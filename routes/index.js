const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const productmodels = require("../models/productmodels");
const router = express.Router();

router.get("/", (req, res) => {
    let error = req.flash("error");
    
    res.render("index", { error });
});


router.get("/shop",isLoggedIn, async (req, res) => {
   let products = await productmodels.find()
    res.render("shop",{products});
    console.log("Products fetched successfully:", products.length);
});

module.exports = router;