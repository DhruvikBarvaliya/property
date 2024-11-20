const { jwt_secret_key } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const SubscriptionModel = require("../Models/SubscriptionModel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../Helpers/email");

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password, type, role } = req.body;
      if (!email) {
        return res
          .status(400)
          .send({ status: false, message: "Email is required" });
      }

      let user = await UserModel.findOne({ email }).select(
        "+password +is_active +is_verified"
      );

      const generateTokenAndRespond = async (user) => {
        const payload = { id: user._id, email, role: user.role };
        const token = jsonwebtoken.sign(payload, jwt_secret_key, {
          expiresIn: "24h",
        });
        user.login_attempts = 0;
        await user.save();
        return res.status(200).json({ email, token });
      };

      if (type === "google" || type === "facebook") {
        if (user) {
          return generateTokenAndRespond(user);
        }

        const newUser = new UserModel({
          email,
          is_active: true,
          is_verified: true,
          role,
        });

        try {
          const savedUser = await newUser.save();
          let subscription;
          const subscriptions_expire = new Date();

          if (savedUser.is_new) {
            const subscriptions_expire = new Date();
            subscriptions_expire.setMonth(subscriptions_expire.getMonth() + 1);
            subscription = await SubscriptionModel.findOne({
              plan_name: "Free Plan",
            });
          }
          await UserModel.updateOne(
            { email },
            {
              $set: {
                is_verified: true,
                is_active: true,
                is_new: false,
                is_paid: true,
                subscriptions_id: subscription
                  ? subscription._id
                  : savedUser.subscriptions_id,
                subscriptions_expire,
              },
            }
          );
          return generateTokenAndRespond(savedUser);
        } catch (error) {
          return res
            .status(400)
            .send({ status: false, message: "Error", error: error.message });
        }
      }

      if (!user) {
        user.login_attempts += 1;
        await user.save();
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      if (!user.is_active) {
        user.login_attempts += 1;
        await user.save();
        return res
          .status(404)
          .json({ status: false, message: "User is not active" });
      }
      if (!user.is_verified) {
        user.login_attempts += 1;
        await user.save();
        return res
          .status(404)
          .json({ status: false, message: "User is not verified" });
      }
      if (!user.password) {
        return res.status(404).json({
          status: false,
          message: "Please try with Google or Facebook Login",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        user.login_attempts += 1;
        await user.save();
        return res
          .status(401)
          .json({ status: false, message: "Invalid credentials" });
      }

      return generateTokenAndRespond(user);
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server error",
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
      let subscription;
      const subscriptions_expire = new Date();
      subscriptions_expire.setMonth(subscriptions_expire.getMonth() + 1);
      if (user.is_new) {
        const subscriptions_expire = new Date();
        subscriptions_expire.setMonth(subscriptions_expire.getMonth() + 1);
        subscription = await SubscriptionModel.findOne({
          plan_name: "Free Plan",
        });
      }
      await UserModel.updateOne(
        { email },
        {
          $set: {
            is_verified: true,
            is_active: true,
            is_new: false,
            is_paid: true,
            subscriptions_id: subscription
              ? subscription._id
              : user.subscriptions_id,
            subscriptions_expire,
          },
        }
      );

      const payload = { id: user._id, email, role: user.role };
      let token = jsonwebtoken.sign(payload, jwt_secret_key, {
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
      let token = jsonwebtoken.sign(payload, jwt_secret_key, {
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
  getLoginAttempts: async (req, res) => {
    try {
      const loginAttempts = await UserModel.find({}, "email login_attempts");
      return res.status(200).json({ loginAttempts });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
