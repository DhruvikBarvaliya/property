const FeedBackModel = require("../Models/FeedBackModel");

module.exports = {
  createFeedback: async (req, res) => {
    try {
      const feedBackData = new FeedBackModel(req.body);
      await feedBackData.save();
      return res
        .status(201)
        .json({ message: "FeedBack response added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllFeedbacks: async (req, res) => {
    try {
      const allFeedBack = await FeedBackModel.find({
        is_active: true,
      }).sort({
        createdAt: 1,
      });
      if (!allFeedBack.length) {
        return res.status(404).json({
          status: false,
          message: "FeedBack Not Found In Database",
        });
      }
      return res.status(200).json({
        status: true,
        message: "FeedBack Retrieved Successfully",
        allFeedBack,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getFeedbackById: async (req, res) => {
    try {
      const { feedBack_id } = req.params;
      const feedBack = await FeedBackModel.findOne({
        _id: feedBack_id,
        is_active: true,
      });
      if (!feedBack) {
        return res.status(404).json({
          status: false,
          message: `FeedBack Not Found With ID: ${feedBack_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "FeedBack Retrieved Successfully",
        feedBack,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateFeedback: async (req, res) => {
    try {
      const { feedBack_id } = req.params;
      const feedBack = await FeedBackModel.findByIdAndUpdate(
        feedBack_id,
        req.body,
        {
          new: true,
        }
      );
      if (!feedBack) {
        return res.status(404).json({
          status: false,
          message: `FeedBack Not Found With ID: ${feedBack_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "FeedBack Updated Successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  feedBackStatus: async (req, res) => {
    try {
      const { feedBack_id, status } = req.params;
      const feedBack = await FeedBackModel.findByIdAndUpdate(
        feedBack_id,
        { is_active: status },
        { new: true }
      );
      if (!feedBack) {
        return res.status(404).json({
          status: false,
          message: `FeedBack Not Found With ID: ${feedBack_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "FeedBack Status Updated Successfully",
        feedBack,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  searchFeedBack: async (req, res) => {
    const { keyword, limit, skip } = req.query;

    try {
      const regex = new RegExp(keyword, "i");

      const allFeedBack = await FeedBackModel.find({
        $or: [{ feedbackText: { $regex: regex } }],
        is_active: true,
      })
        .sort({ createdAt: -1 }) // Sorting by created date in descending order
        .limit(parseInt(limit)) // Limit for pagination
        .skip(parseInt(skip)); // Skip for pagination

      const total = await FeedBackModel.countDocuments({
        $or: [{ feedbackText: { $regex: regex } }],
        is_active: true,
      });

      if (!allFeedBack.length) {
        return res.status(404).json({
          status: false,
          message: "No FeedBack found.",
        });
      }

      return res.status(200).json({
        status: true,
        total,
        length: allFeedBack.length,
        message: "FeedBack retrieved successfully.",
        allFeedBack,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  deleteFeedback: async (req, res) => {
    try {
      const { feedBack_id } = req.params;
      const feedBack = await FeedBackModel.findByIdAndUpdate(
        feedBack_id,
        { is_active: false },
        { new: true }
      );
      if (!feedBack) {
        return res.status(404).json({
          status: false,
          message: `FeedBack Not Found With ID: ${feedBack_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "FeedBack Deleted Successfully",
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
