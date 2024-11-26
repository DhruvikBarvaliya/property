const mongoose = require("mongoose");
let { mongo_uri, db_user, db_password, db_ip } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const SubscriptionModel = require("../Models/SubscriptionModel");
const bcrypt = require("bcryptjs");

module.exports = async function () {
  mongo_uri = `mongodb://${db_user}:${db_password}@${db_ip}:27017/Property?authSource=Property`;
  mongoose.set("strictQuery", false);
  await mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let planData;
  console.log("Database Successfully Connected");
  const adminExists = await UserModel.exists({ role: "SUPER_ADMIN" });
  const subPlan = await SubscriptionModel.exists({ plan_name: "Free Plan" });
  if (!subPlan) {
    const defaultPlan = new SubscriptionModel({
      plan_no: 1,
      plan_name: "Free Plan",
      no_of_report: 15,
      price: 0,
      specification: [
        "Estimated Fair Market Value",
        "Distress Value",
        "Realizable Value",
        "Property Coordinates",
      ],
      final_price: 0,
    });

    try {
      planData = await defaultPlan.save();
      console.log(
        `Default Plan Created Successfully with Plan Name "Free Plan" and ID ${planData._id}`
      );
    } catch (error) {
      console.log(error.message);
    }
  } else {
    planData = await SubscriptionModel.findOne({ plan_name: "Free Plan" });
  }
  if (!adminExists) {
    const subscriptions_expire = new Date();

    const password = await bcrypt.hash("superadmin", 10);
    const userData = new UserModel({
      email: "superadmin@gmail.com",
      password: password,
      is_verified: true,
      is_active: true,
      is_paid: true,
      role: "SUPER_ADMIN",
      name: "super",
      phone: "9998867024",
      subscriptions_id: planData._id,
      subscriptions_expire: subscriptions_expire.setMonth(
        subscriptions_expire.getMonth() + 1
      ),
      module: [
        "User",
        "Staff",
        "Property",
        "Add Property",
        "Edit Property",
        "Delete Property",
        "Unlisted Property",
      ],
      // module: [
      //   "PROPERTY",
      //   "USER",
      //   "RAZORPAY",
      //   "SUBSCRIPTION",
      //   "REPORT",
      //   "CONFIG",
      // ],
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
