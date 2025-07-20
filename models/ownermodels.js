const mongoose = require("mongoose");


const ownerSchema = mongoose.Schema({
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
    gstno: {
        type: String,
        required: true,
    },
    products: {
        type: Array,
        default:[],
    },
    profileImage: {
        type: String,
    },
});

module.exports = mongoose.model("owner", ownerSchema);