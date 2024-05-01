const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const SubscriptionController = require("../Controllers/SubscriptionController");

// Simplify route definitions by using route chaining
router
  .route("/subscription")
  .post(SubscriptionController.addSubscriptionPlan)
  .get(authorize(), SubscriptionController.getAllSubscriptionPlan);

router
  .route("/subscription/:subscription_id")
  .get(authorize(), SubscriptionController.getSubscriptionPlanById)
  .put(authorize(), SubscriptionController.updateSubscriptionPlan)
  .delete(authorize(), SubscriptionController.deleteSubscriptionPlan);

router.put(
  "/subscription/:subscription_id/:status",
  authorize(),
  SubscriptionController.updateSubscriptionPlanStatus
);

module.exports = router;
