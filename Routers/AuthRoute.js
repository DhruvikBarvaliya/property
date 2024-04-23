const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const AuthController = require("../Controllers/AuthController");

router.post("/login", AuthController.login);
router.post("/change-password", authorize(), AuthController.changePassword);

module.exports = router;
