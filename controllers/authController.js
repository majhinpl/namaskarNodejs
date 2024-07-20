const { users } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailSender");
const { text } = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");

exports.renderRegisterPage = (req, res) => {
  res.render("auth/register");
};

exports.handleRegister = async (req, res) => {
  // Handle registration logic
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({
      message: "please provide username, email, password",
    });
    return;
  }

  // Check if email or username already exists
  const [existingUser] = await users.findAll({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    res.status(400).json({
      message: "Email or username already exists",
    });
    return;
  }

  await users.create({
    username,
    email,
    password: bcrypt.hashSync(password, 9),
  });

  sendEmail({
    email: email,
    subject: "Registration Successful",
    text: `${username}, Welcome to our Team.`,
  });

  res.redirect("/auth/login");
};

exports.renderLoginPage = (req, res) => {
  res.render("auth/login");
};

exports.handleLogin = async (req, res) => {
  // Handle login logic
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send("please provide required field");
  }

  const [data] = await users.findAll({
    where: {
      email,
    },
  });

  if (data) {
    // next password check
    const isMatched = bcrypt.compareSync(password, data.password);

    if (isMatched) {
      const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, {
        expiresIn: "20d",
      });

      res.cookie("jwtToken", token);
      res.redirect("/");
    } else {
      res.send("Invalid password");
    }
  } else {
    res.send("User not found!");
  }
};

exports.renderForgetPasswordPage = (req, res) => {
  res.render("./auth/resetPasswordPage");
};

exports.handleForgetPassword = async (req, res) => {
  const { email } = req.body;
  const data = await users.findAll({
    where: {
      email: email,
    },
  });

  if (data.length === 0) return res.send("Invalid user");

  const otp = Math.floor(Math.random() * 1000) + 9999;

  // send that otp to above incoming email
  await sendEmail({
    email: email,
    subject: "Your reset password OTP",
    text: `Your otp is ${otp}`,
  });
  data[0].otp = otp;
  await data[0].save();

  res.redirect("verifyOtp");
};

exports.renderVerifyOtpPage = (req, res) => {
  res.render("./auth/verifyOtp");
};
