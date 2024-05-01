const SubscriptionModel = require("../Models/SubscriptionModel");

module.exports = {
  addSubscriptionPlan: async (req, res) => {
    try {
      const { plan_no, plan_name, no_of_report, price, discount } = req.body;
      const requiredFields = { plan_no, plan_name, no_of_report, price };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          return res
            .status(400)
            .json({ status: false, message: `${key} is Required` });
        }
      }

      let final_price =
        req.body.final_price || (price * (100 - (discount || 0))) / 100;

      const subscriptionplanData = new SubscriptionModel({
        ...req.body,
        final_price,
      });

      await subscriptionplanData.save();
      return res
        .status(201)
        .json({ message: "SubscriptionPlan added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllSubscriptionPlan: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0);
      const allSubscriptionPlan = await SubscriptionModel.find({
        is_active: true,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      const total = await SubscriptionModel.countDocuments();

      if (!allSubscriptionPlan.length) {
        return res.status(404).json({
          status: false,
          message: "SubscriptionPlan Not Found In Database",
        });
      }

      return res.status(200).json({
        status: true,
        total,
        length: allSubscriptionPlan.length,
        message: "SubscriptionPlan Retrieved Successfully",
        allSubscriptionPlan,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getSubscriptionPlanById: async (req, res) => {
    try {
      const { subscription_id } = req.params;
      const subscriptionplan = await SubscriptionModel.findOne({
        _id: subscription_id,
        is_active: true,
      });
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscription_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "SubscriptionPlan Retrieved Successfully",
        subscriptionplan,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateSubscriptionPlan: async (req, res) => {
    try {
      const { subscription_id } = req.params;
      const subscriptionplan = await SubscriptionModel.findByIdAndUpdate(
        subscription_id,
        req.body,
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscription_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "SubscriptionPlan Updated Successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateSubscriptionPlanStatus: async (req, res) => {
    try {
      const { subscription_id, status } = req.params;
      const subscriptionplan = await SubscriptionModel.findByIdAndUpdate(
        subscription_id,
        { is_active: status },
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscription_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "SubscriptionPlan Status Updated Successfully",
        subscriptionplan,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteSubscriptionPlan: async (req, res) => {
    try {
      const { subscription_id } = req.params;
      const subscriptionplan = await SubscriptionModel.findByIdAndUpdate(
        subscription_id,
        { is_active: false },
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscription_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "SubscriptionPlan Deleted Successfully",
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
