const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/authRoute");
const questionRoute = require("./routes/questionRoute");
require("./database/index");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // SSR techstacks
app.use(express.json()); // CSR techstacks
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/auth", authRoute);
app.use("/", questionRoute);

app.use(express.static("public/style/"));

app.listen(PORT, () => {
  console.log(`server listening at ${PORT}`);
});
