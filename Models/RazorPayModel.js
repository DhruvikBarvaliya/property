const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const razorPaySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    subscriptions_id: { type: Schema.Types.ObjectId, ref: "subscription" },
    razor_pay_response: Schema.Types.Mixed,
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("razorpay", razorPaySchema);
