const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const RazorPayController = require("../Controllers/RazorPayController");

router.post(
  "/razorpay",
  RazorPayController.addRazorPay
);
router.get("/razorpay",authorize(), RazorPayController.getAllRazorPay);
router.get(
  "/razorpay/byRazorPayId/:razorpay_id",
  authorize(),
  RazorPayController.getRazorPayById
);

router.put(
  "/razorpay/:razorpay_id",
  authorize(),
  RazorPayController.updateRazorPay
);
router.put(
  "/razorpay/:razorpay_id/:status",
  authorize(),
  RazorPayController.updateRazorPayStatus
);
router.delete(
  "/razorpay/:razorpay_id",
  authorize(),
  RazorPayController.deleteRazorPay
);

module.exports = router;
