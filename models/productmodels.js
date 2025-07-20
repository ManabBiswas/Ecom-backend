const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/ecommerce");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    rate: {
        type: Number,
        default: 4.5,},
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    image: {
        type: Buffer,
        required: true,
    },
    
    bgColor: {
        type: String,
        required: true,
    },
    textColor: {
        type: String,
        required: true,
    },
    panelColor: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("product", productSchema);