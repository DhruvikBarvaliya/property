const mongoose = require("mongoose");
const { mongo_uri } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

module.exports = async function () {
  mongoose.set("strictQuery", false);
  await mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Database Successfully Connected");
  const adminExists = await UserModel.exists({ role: "SUPER_ADMIN" });

  if (!adminExists) {
    const password = await bcrypt.hash("superadmin", 10);
    const userData = new UserModel({
      email: "superadmin@gmail.com",
      password: password,
      is_verified: true,
      is_active: true,
      role: "SUPER_ADMIN",
      name: "super",
      phone: "9998867024",
      module: [
        "PROPERTY",
        "USER",
        "RAZORPAY",
        "SUBSCRIPTION",
        "REPORT",
        "CONFIG",
      ],
    });

    try {
      const adminData = await userData.save();
      console.log(
        `Super Admin Created Successfully with Email "superadmin@gmail.com" and ID ${adminData._id}`
      );
    } catch (error) {
      console.log(error.message);
    }
  }
};
