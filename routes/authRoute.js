const express = require("express");
const router = express.Router();
const {
  renderRegisterPage,
  handleRegister,
  renderLoginPage,
  handleLogin,
} = require("../controllers/authController");
const { errorHandler } = require("../utils/catchAsyncError");

router
  .route("/register")
  .get(renderRegisterPage)
  .post(errorHandler(handleRegister));

router.route("/login").get(renderLoginPage).post(errorHandler(handleLogin));

module.exports = router;
