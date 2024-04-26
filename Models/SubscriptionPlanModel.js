const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema directly from mongoose
mongoose.pluralize(null);

const SubscriptionPlanSchema = new Schema(
  {
    plan_no: Number,
    plan_name: { type: String, trim: true },
    no_of_report: Number,
    price: Number,
    discount: Number,
    final_price: Number,
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("subscriptionplan", SubscriptionPlanSchema);
