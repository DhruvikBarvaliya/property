const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.pluralize(null);

const roles = [
  "SUPER_ADMIN",
  "ADMIN",
  "BANKER",
  "VALUER",
  "INDIVIDUAL",
  "BROKER",
];
const bankerRoles = [
  "",
  "Axis Bank",
  "Bank of Baroda",
  "Baroda Gujarat Gramin Bank",
  "Sutex Bank",
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
  "Union Bank of India",
  "Home First Finance Company",
  "Jana Small Finance Bank",
];

const UserSchema = new Schema(
  {
    role: { type: String, enum: roles, default: "BANKER" },
    name: { type: String, trim: true },
    phone: { type: String },
    banker_role_value: { type: String, enum: bankerRoles },
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
    module: { type: Array },
    otp: { type: Number },
    forgot_otp: { type: Number },
    is_paid: { type: Boolean, default: false },
    no_of_report: { type: Number, default: 0 },
    login_attempts: { type: Number, default: 0 },
    no_of_pdf: { type: Number, default: 0 },
    is_verified: { type: Boolean, default: false },
    status: { type: String, trim: true },
    is_active: { type: Boolean, default: false },
    last_login: { type: Date },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
