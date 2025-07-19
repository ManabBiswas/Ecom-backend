const jwt = require('jsonwebtoken');
const userModel = require('../models/usermodels'); 
module.exports = async (req, res, next) => {
    if (!req.cookies.token) {
        req.flash("error", "Please login first");
        return res.redirect("/login");        // return res.status(401).json({
        //     success: false,
        //     message: "Please login first"
        // });
    }

    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY || 'fallback-secret');
        const user = await userModel.findById(decoded.userId).select("-password");
        req.user = user;
        next();
    }
    catch (err) {
        console.error("Authentication error:", err.message);
        req.flash("error", "Something went wrong with authentication, please login again");
        return res.redirect("/");
        // return res.status(401).json({
        //     success: false,
        //     message: "Invalid token, please login again"
        // });
    }
}