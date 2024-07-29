const { users } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailSender");
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

  res.redirect("/login");
};

exports.renderLoginPage = (req, res) => {
  const [error] = req.flash("error");
  console.log(error);
  res.render("auth/login", { error });
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
      req.flash("success", "Logged in successfully");
      res.redirect("/");
    } else {
      res.send("Invalid password");
    }
  } else {
    req.flash("error", "invalid email");
    res.redirect("/login");
  }
};

exports.renderForgetPasswordPage = (req, res) => {
  res.render("auth/forgetPasswordPage");
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
  data[0].otpGeneratedTime = Date.now();
  await data[0].save();

  res.redirect("verifyOtp?email=" + email);
};

exports.renderVerifyOtpPage = (req, res) => {
  const email = req.query.email;
  res.render("auth/verifyOtp", { email: email });
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.id;

  const data = await users.findAll({
    where: {
      otp: otp,
      email: email,
    },
  });

  if (data.length === 0) {
    return res.send("invalid Otp");
  }

  const currentTime = Date.now();
  const otpGeneratedTime = data[0].otpGeneratedTime;

  if (currentTime - otpGeneratedTime <= 120000) {
    res.redirect(`/resetPassword?email=${email}&otp=${otp}`);
  } else {
    res.send("Otp expired");
  }
};

exports.renderResetPassword = async (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp) {
    return res.send("please provide email, otp in query");
  }
  res.render("auth/resetPassword", { email, otp });
};

exports.handleResetPassword = async (req, res) => {
  const { email, otp } = req.params;
  const { newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.send("Please provide email, otp, newPassword, confirmPassword");
  }
  if (newPassword !== confirmPassword) {
    return res.send("Password not matched!");
  }

  const userData = await users.findAll({
    where: {
      email,
      otp,
    },
  });

  const currentTime = Date.now();
  const otpGeneratedTime = userData[0].otpGeneratedTime;

  if (currentTime - otpGeneratedTime <= 120000) {
    await users.update(
      {
        password: bcrypt.hashSync(newPassword, 10),
      },
      {
        where: {
          email: email,
        },
      }
    );
    res.redirect("/login");
  } else {
    res.send("otp expired !!");
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwtToken");
  res.redirect("/login");
};
