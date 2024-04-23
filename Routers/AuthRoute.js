const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const AuthController = require("../Controllers/AuthController");

router.post("/login", AuthController.login);
router.post("/send-otp", AuthController.sendOtp);
router.post("/verify", AuthController.verify);
router.post("/change-password", authorize(), AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);

module.exports = router;
