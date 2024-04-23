const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const SubscriptionPlanController = require("../Controllers/SubscriptionPlanController");

router.post(
  "/subscription",
  SubscriptionPlanController.addSubscriptionPlan
);
router.get("/subscription",authorize(), SubscriptionPlanController.getAllSubscriptionPlan);
router.get(
  "/subscription/bySubscriptionPlanId/:subscription_id",
  authorize(),
  SubscriptionPlanController.getSubscriptionPlanById
);

router.put(
  "/subscription/:subscription_id",
  authorize(),
  SubscriptionPlanController.updateSubscriptionPlan
);
router.put(
  "/subscription/:subscription_id/:status",
  authorize(),
  SubscriptionPlanController.updateSubscriptionPlanStatus
);
router.delete(
  "/subscription/:subscription_id",
  authorize(),
  SubscriptionPlanController.deleteSubscriptionPlan
);

module.exports = router;
