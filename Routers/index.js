const express = require("express");
const router = express.Router();
const AuthRoute = require("./AuthRoute");
const UserRoute = require("./UserRoute");
const PropertyRoute = require("./PropertyRoute");
const RazorPayRoute = require("./RazorPayRoute");
const SubscriptionPlanRoute = require("./SubscriptionPlanRoute");
const ConfigRoute = require("./ConfigRoute");

router.get("/", (req, res) => {
  res.send(`Welcome To Property Portal With Version V1`);
});

router.use("/v1", AuthRoute, UserRoute, PropertyRoute, RazorPayRoute, SubscriptionPlanRoute,ConfigRoute);

module.exports = router;
