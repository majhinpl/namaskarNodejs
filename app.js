const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;

const authRoute = require("./routes/authRoute");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/auth", authRoute);

app.listen(PORT, () => {
  console.log(`server listening at ${PORT}`);
});
