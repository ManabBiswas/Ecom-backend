const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("owners route is working now!");
});


module.exports = router;