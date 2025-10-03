const mongoose = require("mongoose");
const debug = require("debug")("app:mongoose");

// In production, always use environment variable
const url = process.env.NODE_ENV === 'production' 
    ? process.env.MONGODB_URI 
    : 'mongodb://127.0.0.1:27017/ecommerce';

if (!url) {
    console.error('MongoDB URL is not configured. Please set MONGODB_URI environment variable.');
    process.exit(1);
}

const connect = mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    debug(`Database connected to ${url}`);
    console.log("Database connected successfully");
}).catch((err) => {
    debug(`Database connection error: ${err}`);
    console.error("Database connection error:", err);
    process.exit(1);
});

module.exports = connect;
