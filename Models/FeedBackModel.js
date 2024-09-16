const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedbackText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    is_active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Feedback = mongoose.model("feedback", FeedbackSchema);

module.exports = Feedback;
