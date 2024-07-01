const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const UnListedPropertySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    distance: { type: Number },
    type_of_property: { type: String },
    owner_name: { type: String },
    owner_address: { type: String },
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
    loading: { type: Number },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

UnListedPropertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("UnListedProperty", UnListedPropertySchema);
