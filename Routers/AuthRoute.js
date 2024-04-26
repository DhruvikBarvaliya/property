const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const {
  login,
  sendOtp,
  verify,
  changePassword,
  forgotPassword,
} = require("../Controllers/AuthController");

router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify", verify);
router.post("/change-password", authorize(), changePassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;
