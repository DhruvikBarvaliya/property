const UserModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

module.exports = {
  addUser: async (req, res) => {
    try {
      const { role, email, password } =
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
      if (!password) {
        return res
          .status(400)
          .json({ status: false, message: "password is Required" });
      }


      const user = await UserModel.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ status: true, message: "User already registered" });
      } else {
        const userData = new UserModel({
          role,
          email,
          password,
        });
        userData
          .save()
          .then((data) => {
            return res
              .status(201)
              .json({ message: "User registered Successfully" });
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
      let allUser = await UserModel.find().sort({ percentage: -1 });
      allUser = allUser.filter((user) => user.role != "SUPER_ADMIN");

      if (allUser.length == 0) {
        return res
          .status(404)
          .json({ status: false, message: `User Not Found In Database` });
      }


      return res.status(200).json({
        status: true,
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
      const user = await UserModel.findById({ _id: user_id });
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
      const user = await UserModel.find({ role: role });
      if (user == null) {
        return res.status(404).json({
          status: false,
          message: `User Not Found With ID :- ${role} `,
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
        user_id,
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
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const user = await UserModel.findByIdAndUpdate(
        user_id,
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
