const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.pluralize(null);

const SubscriptionPlanSchema = new Schema(
    {
        plan_name: { type: String, trim: true },
        no_of_report: { type: Number, default: 1 },
        price: { type: Number },
        status: { type: String, trim: true },
        is_active: { type: Boolean, default: true },
    },
    { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("subscriptionplan", SubscriptionPlanSchema);
