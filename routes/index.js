const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});


router.get("/shop",isLoggedIn, (req, res) => {
    let error = req.flash("error");
    
    res.render("index", { error });
});

module.exports = router;