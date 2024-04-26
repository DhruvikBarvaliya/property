const RazorPayModel = require("../Models/RazorPayModel");

module.exports = {
  addRazorPay: async (req, res) => {
    try {
      const { user_id, razor_pay_response } = req.body;
      if (!user_id || !razor_pay_response) {
        return res.status(400).json({
          status: false,
          message: `razorpay_${!user_id ? "id" : "response"} is Required`,
        });
      }
      const razorpayData = new RazorPayModel({
        user_id,
        razor_pay_response,
      });
      await razorpayData.save();
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
