const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const authRoute = require("./routes/authRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");
const { questions, users, answers, sequelize } = require("./database/index");
const socketio = require("socket.io");
const { QueryTypes } = require("sequelize");
require("./database/index");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // SSR techstacks
app.use(express.json()); // CSR techstacks
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

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
  const [success] = req.flash("success");
  const data = await questions.findAll({
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  }); // return in array
  res.render("index", { data, success });
});

app.use("/", authRoute);
app.use("/", questionRoute);
app.use("/answer", answerRoute);

app.use(express.static("public/style/"));
app.use(express.static("./storage"));

const server = app.listen(PORT, () => {
  console.log(`server listening at ${PORT}`);
});

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("like", async ({ answerId, cookie }) => {
    const answer = await answers.findByPk(id);
    if (answer && cookie) {
      const decryptedResult = await promisify(jwt.verify)(
        cookie,
        process.env.JWT_SECRET
      );
      if (decryptedResult) {
        sequelize.query(
          `INSERT INTO likes_${answerId}
(userId VALUES(${decryptedResult.id}))`,
          {
            type: QueryTypes.INSERT,
          }
        );
      }

      const likeCount = likes.length;
      const user = await sequelize.query(
        `SELECT * FROM likes_${answerId} WHERE userId=${decryptedResult.id}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      if (user.length === 0) {
        await sequelize.query(
          `INSERT INTO likes_${answerId} (userId) VALUES(${decryptedResult.id})`,
          {
            type: QueryTypes.INSERT,
          }
        );
      }

      const likes = await sequelize.query(`SELECT * FROM likes_${answerId}`, {
        type: QueryTypes.SELECT,
      });

      const likesCount = likes.length;
      console.log(likeCount);

      socket.emit("likeUpdate", { likesCount, answerId });
    }
  });
});
