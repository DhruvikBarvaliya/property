const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.pluralize(null);

const RazorPaySchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "user" },
        razor_pay_response: { type: Object },
        status: { type: String, trim: true },
        is_active: { type: Boolean, default: true },
    },
    { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("razorpay", RazorPaySchema);
