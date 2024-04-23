const { jwt_secret_key } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendMail } = require('../Helpers/email')

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User Not Found" });
      }
      if (user.is_active == false) {
        return res
          .status(404)
          .json({ status: false, message: "User is Not Active" });
      }
      if (user.is_verified == false) {
        return res
          .status(404)
          .json({ status: false, message: "User is Not verified" });
      }
      let pass = await bcrypt.compare(password, user.password);

      const payload = { id: user._id, email: email, role: user.role };

      const expiresIn = "8d";

      if (user.email == email && pass) {
        const token = jsonwebtoken.sign(payload, jwt_secret_key, { expiresIn });
        return res.status(200).json({ email, token });
      } else {
        return res
          .status(401)
          .json({
            status: false,
            message: "Please Provide Valid Email And Password",
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Server Error",
          error: err.message || err.toString(),
        });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { email, password, newPassword } = req.body;
      const salt = await bcrypt.genSalt(10);
      const updatedPassword = await bcrypt.hash(newPassword, salt);
      const user = await UserModel.findOne({ email: email });

      if (user.email == email && bcrypt.compare(password, user.password)) {
        const user = await UserModel.findOneAndUpdate(
          {email},
          { $set: { password: updatedPassword } },
          { new: true }
        );
        return res
          .status(200)
          .json({
            status: true,
            message: `Password Updated Successfully For Email :- ${email} `,
          });
      } else {
        return res
          .status(401)
          .json({
            status: false,
            message: "Please Provide Valid Email And Password",
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Server Error",
          error: err.message || err.toString(),
        });
    }
  },
  sendOtp: async (req, res) => {
    try {
      const otp = Math.floor(Math.random() * 9000 + 1000);
      let { email, for_forgot } = req.body
      console.log(otp, email);
      const user = await UserModel.findOne({ email: email });
      if (user == null) {
        return res
          .status(404)
          .json({ status: false, message: `User Not Found With Email :- ${email} ` });
      }
      else {
        let purpose = ""
        if (for_forgot) {
          const user = await UserModel.findOneAndUpdate({email},
            { $set: { forgot_otp: otp } },
            { new: true });
          purpose = "Forgot Password"
        } else {
          const user = await UserModel.findOneAndUpdate({email},
            { $set: { otp: otp } },
            { new: true });
          purpose = "Verify Email"

        }
        sendMail(email, otp)
        return res
          .status(200)
          .json({ status: true, message: `Otp Sent Successfully on ${email} for ${purpose}, Please Check and Verify ✔` });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: 'Server Error', error: err.message || err.toString() });
    }
  },
  verify: async (req, res) => {
    try {
      const { email, otp } = req.body
      const user = await UserModel.findOne({ email: email });
      if (user == null) {
        return res
          .status(404)
          .json({ status: false, message: `User Not Found With Email :- ${email} ` });
      } else {
        if (user.otp == otp) {
          const user = await UserModel.findOneAndUpdate({email},
            { $set: { is_verified: true, is_active: true } },
            { new: true });
            const payload = { id: user._id, email: email, role: user.role };
            const expiresIn = "8d";
          const token = jsonwebtoken.sign(payload, jwt_secret_key, { expiresIn });
          return res
            .status(200)
            .json({ status: true, message: `Varification SuccessFully For Email :- ${email} `,token });
        } else {
          return res
            .status(404)
            .json({ status: false, message: `Please Enter Valid OTP` });
        }
      }
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: 'Server Error', error: err.message || err.toString() });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body
      const salt = await bcrypt.genSalt(10);
      const updatedPassword = await bcrypt.hash(newPassword, salt);
      const user = await UserModel.findOne({ email: email });
      if (user == null) {
        return res
          .status(404)
          .json({ status: false, message: `User Not Found With Email :- ${email} ` });
      }
      if (user.email == email && user.forgot_otp == otp) {
        const user = await UserModel.findOneAndUpdate({email},
          { $set: { password: updatedPassword } },
          { new: true });
          const payload = { id: user._id, email: email, role: user.role };
          const expiresIn = "8d";
          const token = jsonwebtoken.sign(payload, jwt_secret_key, { expiresIn });
        // return res.status(200).json({ email, token });
        return res
          .status(200)
          .json({ status: true, message: `Password Updated Successfully For Email :- ${email} `,token });
      } else {
        return res
          .status(401)
          .json({ status: false, message: "Please Provide Valid Email And Otp" });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: 'Server Error', error: err.message || err.toString() });
    }
  }
};
