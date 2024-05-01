const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const ReportSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    latitude: { type: Number },
    longitude: { type: Number },
    distance: { type: Number },
    type_of_property: { type: String },
    carpet_area: { type: Number },
    super_built_up_area: { type: Number },
    plot_area: { type: Number },
    construction_area: { type: Number },
    age_of_property: { type: Number },
    type: { type: String },

    report: { type: Object },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("report", ReportSchema);
