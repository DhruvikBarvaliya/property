const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema directly from mongoose
mongoose.pluralize(null);

const SubscriptionSchema = new Schema(
  {
    // user_id: { type: Schema.Types.ObjectId, ref: "user" },
    plan_no: Number,
    plan_name: { type: String, trim: true },
    no_of_report: Number,
    price: Number,
    per_report_price: Number,
    discount: Number,
    final_price: Number,
    final_price_with_gst: Number,
    specification: Array,
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("subscription", SubscriptionSchema);
