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
  verifyOtp,
  renderResetPassword,
  handleResetPassword,
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
  .get(errorHandler(renderForgetPasswordPage))
  .post(errorHandler(handleForgetPassword));

router.route("/verifyOtp").get(errorHandler(renderVerifyOtpPage));

router.route("/verifyOtp/:id").post(errorHandler(verifyOtp));

router.route("/resetPassword/").get(errorHandler(renderResetPassword));

router
  .route("/resetPassword/:email/:otp")
  .post(errorHandler(handleResetPassword));

router.route("/logout").get(errorHandler(logout));

module.exports = router;
