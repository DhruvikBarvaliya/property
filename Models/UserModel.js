const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.pluralize(null);

const UserSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "BANKER", "VALUER", "INDIVIDUAL", "BROKER"],
      default: "BANKER",
    },
    name: { type: String, trim: true },
    phone: {
      type: String,
      // unique: true,
      // match: [
      //   /^(\+\d{1,3}[- ]?)?\d{10}$/,
      //   "Please fill a valid telephone number",
      // ],
      trim: true,
    },
    banker_role_value: {
      type: String,
      enum: [
        "",
        "Axis Bank",
        "Bank of Baroda",
        "Baroda Gujarat Gramin Bank",
        "Sutex  Bank",
        "UCO Bank",
        "Bank of India",
        "Bank of Maharashtra",
        "Canara Bank",
        "Central Bank of India",
        "City Union Bank",
        "HDFC Bank",
        "Corporation Bank",
        "Federal Bank",
        "ICICI Bank",
        "IDBI Bank",
        "Indian Bank",
        "Indian Overseas Bank",
        "IndusInd Bank",
        "Yes Bank Ltd",
        "Punjab National Bank",
        "PNB Housing Finance",
        "Punjab & Sind Bank",
        "Shamrao Vitthal Co-operative Bank",
        "State Bank of India",
        "UCO Bank",
        "Union Bank of India",
        "Home First Finance Company",
        "Jana Small Finance Bank",
      ],
    },
    email: {
      type: String,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Enter a valid email address",
      ],
      lowercase: true,
      trim: true,
    },
    password: { type: String, trim: true },
    otp: { type: Number },
    forgot_otp: { type: Number },
    is_verified: { type: Boolean, default: false },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: false },
    last_login: { type: Date },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
