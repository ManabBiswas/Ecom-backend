// mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");

const mongoose = require("mongoose");
const url = "mongodb://127.0.0.1:27017/ecommerce";
const connect = mongoose.connect(url).then(() => {
    // console.log("Database connected");
})
.catch((err) => {
    console.log(err);
});
module.exports = connect;
