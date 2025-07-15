const express = require("express");
const router = express.Router();

const ownerModel = require("../models/ownermodels");

router.get("/", (req, res) => {
    res.send("owners route is working now!");
});

router.post("/create", async (req, res) => {
    try {
        let owners = await ownerModel.find();
        if (owners.length === 0) {

            let { fullName, email, password, gstno } = req.body;
            let createdOwner = await ownerModel.create({
                fullName,
                email,
                password,
                gstno

            });
            res.status(201).send(createdOwner);
            console.log("Owner created successfully",createdOwner);
        } else {
            res.status(503).send("Owner already exists. You do not have permission to create another owner");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;