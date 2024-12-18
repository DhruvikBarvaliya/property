const UserModel = require("../Models/UserModel");
const SubscriptionModel = require("../Models/SubscriptionModel");

const bcrypt = require("bcryptjs");
const { sendMail } = require("../Helpers/email");

module.exports = {
  addUser: async (req, res) => {
    const { role, banker_role_value, email, name, phone, password, module } =
      req.body;

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
        module,
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
  addStaff: async (req, res) => {
    const { role, banker_role_value, email, name, phone, password, module } =
      req.body;

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
      // const otp = Math.floor(Math.random() * 9000 + 1000);

      const userData = new UserModel({
        role,
        banker_role_value,
        email,
        name,
        phone,
        password: hashedPassword,
        // otp,
        module,
        is_verified: true,
        is_active: true,
      });

      // await sendMail(email, otp);
      // console.log(email, otp);

      await userData.save();
      // await UserModel.updateOne({ email }, { $set: { otp } });

      return res.status(201).json({
        message: `Staff registered Successfully, with email :- ${email} and password :- ${password}`,
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
        .select("-password -otp -forgot_otp")
        .limit(limit)
        .skip(skip);
      const total = await UserModel.countDocuments({ is_active: true });

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
      const users = await UserModel.find({
        is_active: true,
        role: { $in: ["BANKER", "VALUER"] },
      })
        .sort({ createdAt: -1 })
        .select("-password -otp -forgot_otp")
        .limit(limit)
        .skip(skip);
      const total = await UserModel.countDocuments({
        is_active: true,
        role: { $in: ["BANKER", "VALUER"] },
      });

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
      let user = await UserModel.findOne({
        _id: user_id,
        is_active: true,
      })
        .select("-password -otp -forgot_otp")
        .populate("subscriptions_id");

      // .select("-password").populate({
      //   path: 'subscriptions_id',
      //   select: '-__v -createdAt -updatedAt',
      //   as: 'subscription'
      // });

      // let subscription = await SubscriptionModel.findOne({
      //   user_id: user_id,
      //   is_active: true,
      // });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }

      if (user.subscriptions_id && new Date() > user.subscriptions_expire) {
        user = await UserModel.findByIdAndUpdate(
          user_id,
          { is_paid: false },
          { new: true }
        );
        // user.subscriptions_id.no_of_report = 0;
      }

      return res.status(200).json({
        status: true,
        message: "User retrieved successfully.",
        user,
        // subscription: subscription || false,
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
        .select("-password -otp -forgot_otp")
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
  checkUserExistence: async (req, res) => {
    const { email } = req.params;

    try {
      const userExists = await UserModel.findOne({ email });

      return res.status(200).json({
        status: true,
        message: "User existence checked successfully.",
        exists: !!userExists,
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
  downloadNoPdf: async (req, res) => {
    const { user_id } = req.params;

    try {
      const user = await UserModel.findById(user_id).select("no_of_pdf");

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }
      if (user.no_of_pdf <= 0) {
        return res.status(404).json({
          status: false,
          message: `User Can not Downlod Pdf,Please Buy Plan : ${user.no_of_pdf}`,
        });
      }

      const updatedNoOfPdf = parseInt(user.no_of_pdf) - 1;
      await UserModel.findByIdAndUpdate(
        user_id,
        { no_of_pdf: updatedNoOfPdf },
        { new: true }
      );
      if (updatedNoOfPdf <= 0) {
        await UserModel.findByIdAndUpdate(
          user_id,
          { is_paid: false },
          { new: true }
        );
      }

      return res.status(200).json({
        status: true,
        message: "Number of Pdf updated successfully.",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateNoOfPdf: async (req, res) => {
    const { user_id, subscriptions_id } = req.params;

    try {
      const user = await UserModel.findById(user_id).select(
        "no_of_pdf"
        // "no_of_report"
      );
      const subscription = await SubscriptionModel.findById(subscriptions_id);

      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }
      // if (user.no_of_pdf <= 0) {
      //   return res.status(404).json({
      //     status: false,
      //     message: `User Can not Downlod Pdf,Please Buy Plan : ${user.no_of_pdf}`,
      //   });
      // }

      // const updatedNoOfPdf = parseInt(user.no_of_pdf) - 1;
      await UserModel.findByIdAndUpdate(
        user_id,
        {
          subscriptions_id,
          no_of_pdf: subscription.no_of_report,
          no_of_report: subscription.no_of_report,
          is_paid: true,
        },
        { new: true }
      );

      return res.status(200).json({
        status: true,
        message: "Number of Pdf updated successfully.",
      });
    } catch (err) {
      console.log(err);
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
      // const user = await UserModel.findByIdAndDelete(user_id);

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
  getUserTypes: async (req, res) => {
    try {
      const userTypes = await UserModel.distinct("role");
      return res.status(200).json({
        status: true,
        message: "User types retrieved successfully.",
        userTypes,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  searchUser: async (req, res) => {
    const { keyword, limit, skip } = req.query;

    try {
      const users = await UserModel.find({
        is_active: true,
        $or: [
          { role: { $regex: keyword, $options: "i" } },
          { banker_role_value: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { name: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
          { module: { $regex: keyword, $options: "i" } },
        ],
      })
        .sort({ createdAt: -1 })
        .select("-password -otp -forgot_otp")
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      const total = await UserModel.countDocuments({
        $or: [
          { role: { $regex: keyword, $options: "i" } },
          { banker_role_value: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { name: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
          { module: { $regex: keyword, $options: "i" } },
        ],
      });

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
};
