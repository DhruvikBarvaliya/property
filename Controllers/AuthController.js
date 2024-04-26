const { jwt_secret_key } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../Helpers/email");

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email }).select(
        "+password +is_active +is_verified"
      );

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User Not Found" });
      }
      if (!user.is_active) {
        return res
          .status(404)
          .json({ status: false, message: "User is Not Active" });
      }
      if (!user.is_verified) {
        return res
          .status(404)
          .json({ status: false, message: "User is Not verified" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid Credentials" });
      }

      const payload = { id: user._id, email, role: user.role };
      const token = jsonwebtoken.sign(payload, jwt_secret_key, {
        expiresIn: "8d",
      });
      return res.status(200).json({ email, token });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { email, password, newPassword } = req.body;
      const user = await UserModel.findOne({ email }).select("+password");

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid Credentials" });
      }

      const updatedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updateOne(
        { email },
        { $set: { password: updatedPassword } }
      );
      return res.status(200).json({
        status: true,
        message: `Password Updated Successfully For Email: ${email}`,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  sendOtp: async (req, res) => {
    try {
      const { email, for_forgot } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With Email: ${email}`,
        });
      }

      const otp = Math.floor(Math.random() * 9000 + 1000);
      const updateField = for_forgot ? "forgot_otp" : "otp";
      const purpose = for_forgot ? "Forgot Password" : "Verify Email";

      await UserModel.updateOne({ email }, { $set: { [updateField]: otp } });
      sendMail(email, otp);
      return res.status(200).json({
        status: true,
        message: `OTP Sent Successfully on ${email} for ${purpose}, Please Check and Verify ✔`,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  verify: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user || user.otp !== otp) {
        return res
          .status(404)
          .json({ status: false, message: `Invalid OTP or User Not Found` });
      }

      await UserModel.updateOne(
        { email },
        { $set: { is_verified: true, is_active: true } }
      );
      const payload = { id: user._id, email, role: user.role };
      const token = jsonwebtoken.sign(payload, jwt_secret_key, {
        expiresIn: "8d",
      });
      return res.status(200).json({
        status: true,
        message: `Verification Successful For Email: ${email}`,
        token,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user || user.forgot_otp !== otp) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid OTP or User Not Found" });
      }

      const updatedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updateOne(
        { email },
        { $set: { password: updatedPassword } }
      );
      const payload = { id: user._id, email, role: user.role };
      const token = jsonwebtoken.sign(payload, jwt_secret_key, {
        expiresIn: "8d",
      });
      return res.status(200).json({
        status: true,
        message: `Password Updated Successfully For Email: ${email}`,
        token,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
