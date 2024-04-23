const RazorPayModel = require("../Models/RazorPayModel");

module.exports = {
    addRazorPay: async (req, res) => {
        try {
            const { razorpay_id,
                razor_pay_response } =
                req.body;
            if (!razorpay_id) {
                return res
                    .status(400)
                    .json({ status: false, message: "razorpay_id is Required" });
            }
            if (!razor_pay_response) {
                return res
                    .status(400)
                    .json({ status: false, message: "razor_pay_response is Required" });
            }
            const razorpayData = new RazorPayModel({
                razorpay_id,
                razor_pay_response
            });
            razorpayData
                .save()
                .then(async (data) => {
                    return res
                        .status(201)
                        .json({ message: "RazorPay response added Successfully" });
                })
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
            let allRazorPay = await RazorPayModel.find().sort({ percentage: -1 });

            if (allRazorPay.length == 0) {
                return res
                    .status(404)
                    .json({ status: false, message: `RazorPay Not Found In Database` });
            }

            return res.status(200).json({
                status: true,
                message: "Student Get Successfully",
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
            const razorpay = await RazorPayModel.findById({ _id: razorpay_id });
            if (razorpay == null) {
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
                { _id: razorpay_id },
                req.body,
                { new: true }
            );
            if (razorpay == null) {
                return res.status(404).json({
                    status: false,
                    message: `RazorPay Not Found With ID :- ${razorpay_id} `,
                    razorpay,
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
            const { razorpay_id, is_active } = req.params;
            const razorpay = await RazorPayModel.findByIdAndUpdate(
                { _id: razorpay_id },
                { $set: { is_active: is_active } },
                { new: true }
            );
            if (razorpay == null) {
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
                { _id: razorpay_id },
                { $set: { is_active: false } },
                { new: true }
            );
            if (razorpay == null) {
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
