const ConfigModel = require("../Models/ConfigModel");

module.exports = {
    addConfig: async (req, res) => {
        try {
            const { config_id,
                config_response } =
                req.body;
            if (!config_id) {
                return res
                    .status(400)
                    .json({ status: false, message: "config_id is Required" });
            }
            if (!config_response) {
                return res
                    .status(400)
                    .json({ status: false, message: "config_response is Required" });
            }
            const configData = new ConfigModel({
                config_id,
                config_response
            });
            configData
                .save()
                .then(async (data) => {
                    return res
                        .status(201)
                        .json({ message: "Config response added Successfully" });
                })
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
    getAllConfig: async (req, res) => {
        try {
            let allConfig = await ConfigModel.find().sort({ percentage: -1 });

            if (allConfig.length == 0) {
                return res
                    .status(404)
                    .json({ status: false, message: `Config Not Found In Database` });
            }

            return res.status(200).json({
                status: true,
                message: "Student Get Successfully",
                allConfig,
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
    getConfigById: async (req, res) => {
        try {
            const { config_id } = req.params;
            const config = await ConfigModel.findById({ _id: config_id });
            if (config == null) {
                return res.status(404).json({
                    status: false,
                    message: `Config Not Found With ID :- ${config_id} `,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "Config Get Successfully", config });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
    updateConfig: async (req, res) => {
        try {
            const { config_id } = req.params;

            const config = await ConfigModel.findByIdAndUpdate(
                { _id: config_id },
                req.body,
                { new: true }
            );
            if (config == null) {
                return res.status(404).json({
                    status: false,
                    message: `Config Not Found With ID :- ${config_id} `,
                    config,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "Config Updated Successfully" });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
    updateConfigStatus: async (req, res) => {
        try {
            const { config_id, is_active } = req.params;
            const config = await ConfigModel.findByIdAndUpdate(
                { _id: config_id },
                { $set: { is_active: is_active } },
                { new: true }
            );
            if (config == null) {
                return res.status(404).json({
                    status: false,
                    message: `Config Not Found With ID :- ${config_id} `,
                });
            }
            return res.status(200).json({
                status: true,
                message: "Config Status Updated Successfully",
                config,
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
    deleteConfig: async (req, res) => {
        try {
            const { config_id } = req.params;
            const config = await ConfigModel.findByIdAndUpdate(
                { _id: config_id },
                { $set: { is_active: false } },
                { new: true }
            );
            if (config == null) {
                return res.status(404).json({
                    status: false,
                    message: `Config Not Found With ID :- ${config_id} `,
                });
            }
            return res
                .status(200)
                .json({ status: true, message: "Config Deleted Successfully" });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Server Error",
                error: err.message || err.toString(),
            });
        }
    },
};
