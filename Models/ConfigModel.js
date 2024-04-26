const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema(
  {
    razorpay_api_key: { type: String, trim: true },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

mongoose.pluralize(null);
module.exports = mongoose.model("config", ConfigSchema);
