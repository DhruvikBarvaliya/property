const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const RazorPayController = require("../Controllers/RazorPayController");

// Simplify route definitions by using route chaining
router.post("/create-order", RazorPayController.createRazorPayOrder);
router
  .route("/razorpay")
  .post(RazorPayController.addRazorPay)
  .get(authorize(), RazorPayController.getAllRazorPay);
router.get("/razorpay/search", authorize(), RazorPayController.searchRazorpay);

router
  .route("/razorpay/:razorpay_id")
  .get(authorize(), RazorPayController.getRazorPayById)
  .put(authorize(), RazorPayController.updateRazorPay)
  .delete(authorize(), RazorPayController.deleteRazorPay);

router.put(
  "/razorpay/:razorpay_id/:status",
  authorize(),
  RazorPayController.updateRazorPayStatus
);

module.exports = router;
