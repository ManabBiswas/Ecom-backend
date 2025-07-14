const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        minLength: 3,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    contactNo: {
        type: Number,
        required: true,
    },
    isadmin: {
        type: Boolean,
        required: true,
    },
    cart: {
        type: Array,
        required: true,
        default:[],
    },
    wishlist: {
        type: Array,
        required: true,
        default:[],
    },
    order: {
        type: Array,
        required: true,
        default:[],
    },
    profileImage: {
        type: String,
    },
});

module.exports = mongoose.model("user", userSchema);