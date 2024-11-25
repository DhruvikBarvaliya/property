const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");

const {
  login,
  sendOtp,
  verify,
  changePassword,
  forgotPassword,
  getLoginAttempts,
  clearAllData,
} = require("../Controllers/AuthController");

router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify", verify);
router.post("/change-password", authorize(), changePassword);
router.post("/forgot-password", forgotPassword);
router.get("/login-attempts", authorize(), getLoginAttempts);
router.get("/clear", authorize([Role.SUPER_ADMIN, Role.ADMIN]), clearAllData);

module.exports = router;
