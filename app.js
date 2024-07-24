const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const authRoute = require("./routes/authRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");
const { questions, users } = require("./database/index");
require("./database/index");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // SSR techstacks
app.use(express.json()); // CSR techstacks
app.use(cookieParser());

app.use(async (req, res, next) => {
  const token = req.cookies.jwtToken;
  try {
    const decryptedResult = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    if (decryptedResult) {
      res.locals.isAuthenticated = true;
    } else {
      res.locals.isAuthenticated = false;
    }
  } catch (error) {
    res.locals.isAuthenticated = false;
  }
  next();
});

app.get("/", async (req, res) => {
  const data = await questions.findAll({
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  }); // return in array
  res.render("index", { data });
});

app.use("/", authRoute);
app.use("/", questionRoute);
app.use("/answer", answerRoute);

app.use(express.static("public/style/"));
app.use(express.static("./storage"));

app.listen(PORT, () => {
  console.log(`server listening at ${PORT}`);
});
