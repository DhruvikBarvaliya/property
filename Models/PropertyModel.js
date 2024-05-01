const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const PropertySchema = new Schema(
  {
    time: { type: String },
    type_of_property: { type: String },
    postal_address_of_the_property: { type: String },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    property_sub_classification: { type: String },
    age_of_the_property: { type: Number },
    type_of_construction: { type: String },
    land_area_sq_mtr_sq_yrd: { type: Number },
    land_rate_per_sq_mtr_Sq_yard: { type: Number },
    construction_area_sq_ft_built_up_area: { type: Number },
    area_rate_considered_per_sq_ft: { type: Number },
    built_up_area: { type: Number },
    super_built_up_area: { type: Number },
    carpet_area: { type: Number },
    area_rate_considered_on: { type: String },
    construction_area_sq_ft_super_built_area: { type: String },
    construction_area_sq_ft_row_1: { type: String },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
    last_login: { type: Date },
  },
  { versionKey: false, timestamps: true }
);

PropertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("property", PropertySchema);
