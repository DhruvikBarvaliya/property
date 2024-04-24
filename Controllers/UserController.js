const UserModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../Helpers/email")

module.exports = {
  addUser: async (req, res) => {
    try {
      const { role,
        banker_role_value,
        email,
        name,
        phone } =
        req.body;
      if (!role) {
        return res
          .status(400)
          .json({ status: false, message: "role is Required" });
      }
      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "email is Required" });
      }
      if (!req.body.password) {
        return res
          .status(400)
          .json({ status: false, message: "password is Required" });
      }
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);

      const user = await UserModel.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ status: true, message: "User already registered" });
      } else {
        const userData = new UserModel({
          role,
          banker_role_value,
          email,
          name,
          phone,
          password,
        });
        const otp = Math.floor(Math.random() * 9000 + 1000);
        await sendMail(email, otp)
        console.log(email, otp);


        userData
          .save()
          .then(async (data) => {
            await UserModel.findOneAndUpdate({ email },
              { $set: { otp: otp } },
              { new: true });
            return res
              .status(201)
              .json({ message: "User registered Successfully ,Please check your Email we sent you OTP for verify that mail" });
          })
      }
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllUser: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0)
      let allUser = await UserModel.find().sort({ percentage: -1 }).select("-password").limit(limit).skip(skip);
      const total = await UserModel.find().count();
      // allUser = allUser.filter((user) => user.role != "SUPER_ADMIN");
      console.log(allUser);
      if (allUser.length == 0) {
        return res
          .status(404)
          .json({ status: false, message: `User Not Found In Database` });
      }


      return res.status(200).json({
        status: true, total, length: allUser.length,
        message: "Student Get Successfully",
        allUser,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { user_id } = req.params;
      const user = await UserModel.findById({ _id: user_id }).select("-password");
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${user_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "User Get Successfully", user });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getUserByRole: async (req, res) => {
    try {
      const { role } = req.params;
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0)
      const user = await UserModel.find({ role: role }).select("-password").limit(limit).skip(skip);
      const total = await UserModel.find().count();

      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${role} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, total, length: user.length, message: "User Get Successfully", user });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getNoOfUser: async (req, res) => {
    try {
      let { date } = req.params
      const result = await UserModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(date),
              $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);

      return res
        .status(200)
        .json({ status: true, message: `Count of User Get Successfully for Date :- ${date} `, count: result.length > 0 ? result[0].count : 0 });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { user_id } = req.params;

      const user = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        req.body,
        { new: true }
      );
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${user_id} `,
          user,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "User Updated Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUserStatus: async (req, res) => {
    try {
      const { user_id, is_active } = req.params;
      const user = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { is_active: is_active } },
        { new: true }
      );
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${user_id} `,
        });
      }
      return res.status(200).json({
        status: true,
        message: "User Status Updated Successfully",
        user,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateNoOfReport: async (req, res) => {
    try {
      const { user_id, no_of_report } = req.params;
      const user = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { no_of_report: no_of_report } },
        { new: true }
      );
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${user_id} `,
        });
      }
      return res.status(200).json({
        status: true,
        message: "User NoOfReport Updated Successfully",
        user,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const user = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { is_active: false } },
        { new: true }
      );
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${user_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "User Deleted Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
