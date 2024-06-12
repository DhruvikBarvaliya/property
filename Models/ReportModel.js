const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const ReportSchema = new Schema(
  {
    name_of_the_customers: { type: String },
    report_date: { type: String },
    case_ref_no: { type: String },
    property_address: { type: String },
    nearest_landmark: { type: String },
    property_land_area: { type: Number },
    built_up_area_carpet_area_super_built_up_area: { type: Number },
    land_value: { type: Number },
    type_of_property: { type: String },
    unit_rate_considered_for_land: { type: Number },
    unit_rate_considered_for_ca_bua_sba: { type: Number },
    building_value: { type: Number },
    final_valuation: { type: Number },
    final_valuation_in_word: { type: String },

    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    latitude: { type: Number },
    longitude: { type: Number },
    distance: { type: Number },
    address: { type: String },
    carpet_area: { type: Number },
    super_built_up_area: { type: Number },
    land_area: { type: Number },
    construction_area: { type: Number },
    age_of_property: { type: Number },
    type: { type: String },
    no_of_floor: { type: Number },
    floor_of_unit: { type: Number },
    flat_no: { type: Number },
    house_no: { type: Number },

    report: { type: Object },
    is_verified: { type: Boolean, default: true },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("report", ReportSchema);
