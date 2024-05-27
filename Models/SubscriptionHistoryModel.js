const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema directly from mongoose
mongoose.pluralize(null);

const SubscriptionHistorySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    subscriptions_id: { type: Schema.Types.ObjectId, ref: "subscription" },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "subscriptionhistory",
  SubscriptionHistorySchema
);
