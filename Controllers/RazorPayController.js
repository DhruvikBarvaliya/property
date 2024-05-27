const RazorPayModel = require("../Models/RazorPayModel");
const UserModel = require("../Models/UserModel");
const SubscriptionModel = require("../Models/SubscriptionModel");
const SubscriptionHistoryModel = require("../Models/SubscriptionHistoryModel");

module.exports = {
  addRazorPay: async (req, res) => {
    try {
      const { user_id, razor_pay_response, subscriptions_id } = req.body;
      if (!user_id || !razor_pay_response || !subscriptions_id) {
        return res.status(400).json({
          status: false,
          message: `razorpay_${
            !user_id ? "id" : "razor_pay_response and subscriptions_id"
          } is Required`,
        });
      }
      const user = await UserModel.findById(user_id).select("no_of_report");
      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }
      const subscription = await SubscriptionModel.findById(subscriptions_id);
      if (!subscription) {
        return res.status(404).json({
          status: false,
          message: `Subscription not found with ID: ${subscriptions_id}`,
        });
      }

      const razorpayData = new RazorPayModel({
        user_id,
        razor_pay_response,
        subscriptions_id,
      });
      await razorpayData.save();

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
      const SubscriptionHistory = new SubscriptionHistoryModel({
        user_id,
        subscriptions_id,
      });
      await SubscriptionHistory.save();

      return res
        .status(201)
        .json({ message: "RazorPay response added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllRazorPay: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0);
      const [allRazorPay, total] = await Promise.all([
        RazorPayModel.find({ is_active: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip),
        RazorPayModel.countDocuments(),
      ]);

      if (!allRazorPay.length) {
        return res
          .status(404)
          .json({ status: false, message: "RazorPay Not Found In Database" });
      }

      return res.status(200).json({
        status: true,
        total,
        length: allRazorPay.length,
        message: "RazorPay Get Successfully",
        allRazorPay,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getRazorPayById: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findOne({
        _id: razorpay_id,
        is_active: true,
      });
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Get Successfully", razorpay });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateRazorPay: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        req.body,
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Updated Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateRazorPayStatus: async (req, res) => {
    try {
      const { razorpay_id, status } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        { is_active: status },
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res.status(200).json({
        status: true,
        message: "RazorPay Status Updated Successfully",
        razorpay,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteRazorPay: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        { is_active: false },
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Deleted Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
