const mongoose = require("mongoose");
const { mongo_uri } = require("../Config/Config");
const UserModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

module.exports = function () {
  mongoose.set("strictQuery", false);
  mongoose.connect(mongo_uri, { useNewUrlParser: true });

  mongoose.connection.on("connected", async () => {
    console.log("Database Successfully Connected");
    UserModel.findOne({ role: "SUPER_ADMIN" }, async function (err, data) {
      if (!data) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash("superadmin", salt);
        const userData = new UserModel({
          email: "superadmin@gmail.com",
          password: password,
          is_verified: true,
          is_active: true,
          role: "SUPER_ADMIN",
          first_name: "super",
          last_name: "admin",
          full_name: "super admin",
          phone: "9998867024",
          marks: 1000,
          total_marks: 1000,
          std: "1st",
        });
        userData
          .save()
          .then((adminData) => {
            console.log(
              `Super Admin Created Successfully with Email "superadmin@gmail.com" witj Password "superadmin" And id ${adminData._id}`
            );
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    });
  });
};
