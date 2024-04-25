const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.pluralize(null);

const ConfigSchema = new Schema(
  {
    razorpay_api_key: { type: String, trim: true },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("config", ConfigSchema);
