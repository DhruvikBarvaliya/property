const UserModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../Helpers/email");

module.exports = {
  addUser: async (req, res) => {
    const { role, banker_role_value, email, name, phone, password } = req.body;

    // Validate required fields
    if (!role || !email || !password) {
      return res.status(400).json({
        status: false,
        message: `${
          !role ? "role" : !email ? "email" : "password"
        } is Required`,
      });
    }

    try {
      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        return res
          .status(400)
          .json({ status: true, message: "User already registered" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const otp = Math.floor(Math.random() * 9000 + 1000);

      const userData = new UserModel({
        role,
        banker_role_value,
        email,
        name,
        phone,
        password: hashedPassword,
        otp,
      });

      await sendMail(email, otp);
      console.log(email, otp);

      await userData.save();
      await UserModel.updateOne({ email }, { $set: { otp } });

      return res.status(201).json({
        message:
          "User registered Successfully, please check your email for OTP verification.",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllUser: async (req, res) => {
    const limit = parseInt(req.query.limit || 10);
    const skip = parseInt(req.query.skip || 0);

    try {
      const users = await UserModel.find({ is_active: true })
        .sort({ createdAt: -1 })
        .select("-password")
        .limit(limit)
        .skip(skip);
      const total = await UserModel.countDocuments();

      if (!users.length) {
        return res
          .status(404)
          .json({ status: false, message: "No users found." });
      }

      return res.status(200).json({
        status: true,
        total,
        length: users.length,
        message: "Users retrieved successfully.",
        users,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllStaff: async (req, res) => {
    const limit = parseInt(req.query.limit || 10);
    const skip = parseInt(req.query.skip || 0);

    try {
      const users = await UserModel.find({ is_active: true, role: "ADMIN" })
        .sort({ createdAt: -1 })
        .select("-password")
        .limit(limit)
        .skip(skip);
      const total = await UserModel.countDocuments();

      if (!users.length) {
        return res
          .status(404)
          .json({ status: false, message: "No staff found." });
      }

      return res.status(200).json({
        status: true,
        total,
        length: users.length,
        message: "Staff retrieved successfully.",
        users,
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
    const { user_id } = req.params;

    try {
      const user = await UserModel.findOne({
        _id: user_id,
        is_active: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User retrieved successfully.",
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
  getUserByRole: async (req, res) => {
    const { role } = req.params;
    const limit = parseInt(req.query.limit || 10);
    const skip = parseInt(req.query.skip || 0);

    try {
      const users = await UserModel.find({ role })
        .select("-password")
        .limit(limit)
        .skip(skip);
      const total = await UserModel.countDocuments({ role });

      if (!users.length) {
        return res.status(404).json({
          status: false,
          message: "No users found with role",
        });
      }

      return res.status(200).json({
        status: true,
        total,
        length: users.length,
        message: "Users retrieved successfully.",
        users,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getModuleByUserId: async (req, res) => {
    const { user_id } = req.params;

    try {
      const user = await UserModel.findOne({
        _id: user_id,
        is_active: true,
      }).select("module");

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User Module retrieved successfully.",
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
  getNoOfUser: async (req, res) => {
    const { date } = req.params;

    try {
      const result = await UserModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(date),
              $lt: new Date(
                new Date(date).setDate(new Date(date).getDate() + 1)
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: `Count of users for date: ${date}`,
        count: result.length ? result[0].count : 0,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUser: async (req, res) => {
    const { user_id } = req.params;

    try {
      const updatedUser = await UserModel.findByIdAndUpdate(user_id, req.body, {
        new: true,
      });

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User updated successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUserStatus: async (req, res) => {
    const { user_id, status } = req.params;

    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        user_id,
        { is_active: status },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User status updated successfully.",
        user: updatedUser,
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
    const { user_id, no_of_report } = req.params;

    try {
      const user = await UserModel.findById(user_id).select("no_of_report");

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      const updatedNoOfReport =
        parseInt(user.no_of_report) + parseInt(no_of_report);
      await UserModel.findByIdAndUpdate(
        user_id,
        { no_of_report: updatedNoOfReport },
        { new: true }
      );

      return res.status(200).json({
        status: true,
        message: "Number of reports updated successfully.",
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
    const { user_id } = req.params;

    try {
      const user = await UserModel.findByIdAndUpdate(
        user_id,
        { is_active: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User deleted successfully.",
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
