const SubscriptionPlanModel = require("../Models/SubscriptionPlanModel");

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

      const subscriptionplanData = new SubscriptionPlanModel({
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
      const allSubscriptionPlan = await SubscriptionPlanModel.find()
        .sort({ percentage: -1 })
        .limit(limit)
        .skip(skip);
      const total = await SubscriptionPlanModel.countDocuments();

      if (!allSubscriptionPlan.length) {
        return res
          .status(404)
          .json({
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
      const { subscriptionplan_id } = req.params;
      const subscriptionplan = await SubscriptionPlanModel.findById(
        subscriptionplan_id
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscriptionplan_id}`,
        });
      }
      return res
        .status(200)
        .json({
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
      const { subscriptionplan_id } = req.params;
      const subscriptionplan = await SubscriptionPlanModel.findByIdAndUpdate(
        subscriptionplan_id,
        req.body,
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscriptionplan_id}`,
        });
      }
      return res
        .status(200)
        .json({
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
      const { subscriptionplan_id, is_active } = req.params;
      const subscriptionplan = await SubscriptionPlanModel.findByIdAndUpdate(
        subscriptionplan_id,
        { is_active },
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscriptionplan_id}`,
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
      const { subscriptionplan_id } = req.params;
      const subscriptionplan = await SubscriptionPlanModel.findByIdAndUpdate(
        subscriptionplan_id,
        { is_active: false },
        { new: true }
      );
      if (!subscriptionplan) {
        return res.status(404).json({
          status: false,
          message: `SubscriptionPlan Not Found With ID: ${subscriptionplan_id}`,
        });
      }
      return res
        .status(200)
        .json({
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
