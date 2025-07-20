const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const productmodels = require("../models/productmodels");
const usermodels = require("../models/usermodels");
const config = require("config");
const router = express.Router();

router.get("/", (req, res) => {
    let error = req.flash("error");
    
    res.render("index", { error });
});


router.get("/shop", async (req, res) => {
   let products = await productmodels.find()
    res.render("shop",{products});
    // console.log("Products fetched successfully:", products.length);
});


router.get("/cart", async (req, res) => {
   let products = await productmodels.find()
    res.render("cart",{products});
    // console.log("Products fetched successfully:", products.length);
});


router.get("/addtoCart/:productId", async (req, res) => {
   let user = await usermodels.findOne({user: req.user.email});
   console.log("User found:", user);
    user.cart.push(req.params.productId);
    await user.save();
    res.redirect("/shop");
});

module.exports = router;