const mongoose = require("mongoose");

const dbgr = require("debug")("development:mongoose");
const config = require("config");

const url = `${config.get("MONGODB_URL")}/ecommerce`;
const connect = mongoose.connect(url).then(() => {
    dbgr("Database connected");
})
.catch((err) => {
    dbgr(err);
});
module.exports = connect;
