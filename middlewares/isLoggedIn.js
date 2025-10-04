const jwt = require('jsonwebtoken');
const userModel = require('../models/usermodels');
const ownerModel = require('../models/ownermodels');

const verifyToken = async (token, role) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY || 'fallback-secret');
        if (role === 'owner' && !decoded.ownerId) {
            throw new Error('Invalid owner token');
        }
        if (role === 'user' && !decoded.userId) {
            throw new Error('Invalid user token');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
};

const getUserOrOwner = async (decoded, role) => {
    try {
        if (role === 'owner') {
            return await ownerModel.findById(decoded.ownerId).select("-password");
        } else {
            return await userModel.findById(decoded.userId).select("-password");
        }
    } catch (error) {
        throw error;
    }
};

const authMiddleware = (role = 'user') => {
    return async (req, res, next) => {
        if (!req || !res || !next) {
            console.error('Invalid middleware execution context');
            return;
        }

        try {
            if (!req.cookies?.token) {
                if (req.xhr || req.headers?.accept?.includes('application/json')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Please login first'
                    });
                }
                if (typeof req.flash === 'function') {
                    req.flash("error", "Please login first");
                }
                return res.redirect(role === 'owner' ? "/owners/login" : "/login");
            }

            try {
                const decoded = await verifyToken(req.cookies.token, role);
                const user = await getUserOrOwner(decoded, role);

                if (!user) {
                    throw new Error(`${role} not found`);
                }

                // Set user or owner in request object
                if (role === 'owner') {
                    req.owner = user;
                } else {
                    req.user = user;
                }

                next();
            } catch (error) {
                console.error("Authentication error:", error.message);
                if (req.cookies?.token) {
                    res.clearCookie('token');
                }

                if (req.xhr || req.headers?.accept?.includes('application/json')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Session expired. Please login again.'
                    });
                }

                if (typeof req.flash === 'function') {
                    req.flash("error", "Session expired. Please login again.");
                }
                return res.redirect(role === 'owner' ? "/owners/login" : "/login");
            }
        } catch (error) {
            console.error("Auth middleware error:", error);
            if (req.xhr || req.headers?.accept?.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
            if (typeof req.flash === 'function') {
                req.flash("error", "Something went wrong. Please try again.");
            }
            return res.redirect(role === 'owner' ? "/owners/login" : "/login");
        }
    };
};

module.exports = authMiddleware;