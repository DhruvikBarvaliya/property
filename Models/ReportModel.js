const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const ReportSchema = new Schema(
  {
    report: { type: Object },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("report", ReportSchema);
