const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const PropertySchema = new Schema(
  {
    time: String,
    type_of_property: String,
    postal_address_of_the_property: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    property_sub_classification: String,
    age_of_the_property: Number,
    type_of_construction: String,
    land_area_sq_mtr_sq_yrd: String,
    land_rate_per_sq_mtr_Sq_yard: String,
    construction_area_sq_ft_built_up_area: Number,
    area_rate_considered_per_sq_ft: Number,
    built_up_area: String,
    super_built_up_area: String,
    carpet_area: String,
    area_rate_considered_on: String,
    construction_area_sq_ft_super_built_area: String,
    construction_area_sq_ft_row_1: String,
    is_verified: { type: Boolean, default: false },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: false },
    last_login: Date,
  },
  { versionKey: false, timestamps: true }
);
PropertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("property", PropertySchema);
