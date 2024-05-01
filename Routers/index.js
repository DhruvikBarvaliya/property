const express = require("express");
const router = express.Router();

// Dynamically import routes to reduce redundancy and improve maintainability
const routes = {
  AuthRoute: require("./AuthRoute"),
  UserRoute: require("./UserRoute"),
  PropertyRoute: require("./PropertyRoute"),
  RazorPayRoute: require("./RazorPayRoute"),
  SubscriptionRoute: require("./SubscriptionRoute"),
  ConfigRoute: require("./ConfigRoute"),
  ReportRoute: require("./ReportRoute"),
};

router.get("/", (req, res) => {
  res.send("Welcome To Property Portal With Version V1");
});

// Use a loop to apply middleware to the router
Object.values(routes).forEach((route) => {
  router.use("/v1", route);
});

module.exports = router;
