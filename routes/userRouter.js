const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("user route is working now!");
});


module.exports = router;