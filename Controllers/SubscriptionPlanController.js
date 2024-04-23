const SubscriptionPlanModel = require("../Models/SubscriptionPlanModel");

module.exports = {
    addSubscriptionPlan: async (req, res) => {
        try {
            const { plan_name,
                no_of_report,
                price } =
                req.body;
            if (!plan_name) {
                return res
                    .status(400)
                    .json({ status: false, message: "plan_name is Required" });
            }
            if (!price) {
                return res
                    .status(400)
                    .json({ status: false, message: "price is Required" });
            }
            const subscriptionplanData = new SubscriptionPlanModel({
                plan_name,
                no_of_report,
                price
            });
            subscriptionplanData
                .save()
                .then(async (data) => {
                    return res
                        .status(201)
                        .json({ message: "SubscriptionPlan response added Successfully" });
                })
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
            let allSubscriptionPlan = await SubscriptionPlanModel.find().sort({ percentage: -1 });

            if (allSubscriptionPlan.length == 0) {
                return res
                    .status(404)
                    .json({ status: false, message: `SubscriptionPlan Not Found In Database` });
            }

            return res.status(200).json({
                status: true,
                message: "Student Get Successfully",
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
            const subscriptionplan = await SubscriptionPlanModel.findById({ _id: subscriptionplan_id });
            if (subscriptionplan == null) {
                return res.status(404).json({
                    status: false,
                    message: `SubscriptionPlan Not Found With ID :- ${subscriptionplan_id} `,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "SubscriptionPlan Get Successfully", subscriptionplan });
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
                { _id: subscriptionplan_id },
                req.body,
                { new: true }
            );
            if (subscriptionplan == null) {
                return res.status(404).json({
                    status: false,
                    message: `SubscriptionPlan Not Found With ID :- ${subscriptionplan_id} `,
                    subscriptionplan,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "SubscriptionPlan Updated Successfully" });
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
                { $set: { is_active: is_active } },
                { new: true }
            );
            if (subscriptionplan == null) {
                return res.status(404).json({
                    status: false,
                    message: `SubscriptionPlan Not Found With ID :- ${subscriptionplan_id} `,
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
                { $set: { is_active: false } },
                { new: true }
            );
            if (subscriptionplan == null) {
                return res.status(404).json({
                    status: false,
                    message: `SubscriptionPlan Not Found With ID :- ${subscriptionplan_id} `,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "SubscriptionPlan Deleted Successfully" });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
};
