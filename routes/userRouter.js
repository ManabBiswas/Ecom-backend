const express = require("express");
const router = express.Router();
const userModel = require('../models/usermodels');

router.get("/", (req, res) => {
    res.send("user route is working now!");
});

router.post("/register", async (req, res) => {
    try {
        let { fullName, email, password, location, contactNo } = req.body;

        // console.log(fullName, email, password, location, contactNo);

        let user = await userModel.create({
            fullName,
            email,
            password,
            location,
            contactNo
        });
        console.log(user);
        res.send(user);
        // res.redirect("/");
    }
    catch (err)  {
    console.log(err.message);
    // res.redirect("/");
    }
})


module.exports = router;