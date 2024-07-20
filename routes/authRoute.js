const express = require("express");
const router = express.Router();
const {
  renderRegisterPage,
  handleRegister,
  renderLoginPage,
  handleLogin,
  renderForgetPasswordPage,
  handleForgetPassword,
  renderVerifyOtpPage,
  logout,
} = require("../controllers/authController");
const { errorHandler } = require("../utils/catchAsyncError");

router
  .route("/register")
  .get(renderRegisterPage)
  .post(errorHandler(handleRegister));

router.route("/login").get(renderLoginPage).post(errorHandler(handleLogin));

router
  .route("/forgetPassword")
  .get(renderForgetPasswordPage)
  .post(errorHandler(handleForgetPassword));

router.route("/verifyOtp").get(renderVerifyOtpPage);
module.exports = router;
