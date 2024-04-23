const { jwt_secret_key } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
        const employee = await UserModel.findOneAndUpdate(
          email,
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
};
