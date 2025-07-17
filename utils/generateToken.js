
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { email: user.email, userId: user._id },
        process.env.JWT_KEY ||
        'fallback-secret',
        { expiresIn: '24h' }
    );
};



module.exports.generateToken = generateToken;