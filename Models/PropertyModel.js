const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.pluralize(null);

const PropertySchema = new Schema(
  {
    time: {
      type: String,
    },
    type_of_property: {
      type: String,
    }, postal_address_of_the_property: {
      type: String,
    }, latitude_longitude: {
      type: String,
    }, property_sub_classification: {
      type: String,
    }, age_of_the_property: {
      type: Number,
    }, type_of_construction: {
      type: String,
    }, land_area_sq_mtr_sq_yrd: {
      type: String,
    }, land_rate_per_sq_mtr_Sq_yard: {
      type: String,
    }, construction_area_sq_ft_built_up_area: {
      type: Number,
    },
    area_rate_considered_per_sq_ft: {
      type: Number,
    }, built_up_area: {
      type: String,
    }, super_built_up_area: {
      type: String,
    }, carpet_area: {
      type: String,
    }, area_rate_considered_on: {
      type: String,
    }, construction_area_sq_ft_super_uilt_area: {
      type: String,
    }, construction_area_sq_ft_row_1: {
      type: String,
    }, construction_area_sq_ft_built_up_area: {
      type: String,
    }, construction_area_sq_ft_super_built_up_area: {
      type: String,
    },
    is_verified: { type: Boolean, default: false },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: false },
    last_login: { type: Date },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("property", PropertySchema);
