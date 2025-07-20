const mongoose = require("mongoose");


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
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        default:[],
    }],
    wishlist: {
        type: Array,
        default:[],
    },
    order: {
        type: Array,
        default:[],
    },
    profileImage: {
        type: String,
    },
});

module.exports = mongoose.model("user", userSchema);