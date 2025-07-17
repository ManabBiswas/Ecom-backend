const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

require('dotenv').config()

const db = require("./config/mongooseConnection");

const ownerRouter = require("./routes/ownerRouter")
const userRouter = require("./routes/userRouter")
const productRouter = require("./routes/productRouter")

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/owners", ownerRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});