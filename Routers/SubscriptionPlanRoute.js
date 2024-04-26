const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const SubscriptionPlanController = require("../Controllers/SubscriptionPlanController");

// Simplify route definitions by using route chaining
router
  .route("/subscription")
  .post(SubscriptionPlanController.addSubscriptionPlan)
  .get(authorize(), SubscriptionPlanController.getAllSubscriptionPlan);

router
  .route("/subscription/:subscription_id")
  .get(authorize(), SubscriptionPlanController.getSubscriptionPlanById)
  .put(authorize(), SubscriptionPlanController.updateSubscriptionPlan)
  .delete(authorize(), SubscriptionPlanController.deleteSubscriptionPlan);

router.put(
  "/subscription/:subscription_id/:status",
  authorize(),
  SubscriptionPlanController.updateSubscriptionPlanStatus
);

module.exports = router;
