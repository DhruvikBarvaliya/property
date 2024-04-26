const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const ReportController = require("../Controllers/ReportController");

// Simplify route definitions by using route chaining
router
  .route("/report")
  .post(authorize(), ReportController.addReport)
  .get(authorize(), ReportController.getAllReport);

router
  .route("/report/:report_id")
  .get(authorize(), ReportController.getReportById)
  .put(authorize(), ReportController.updateReport)
  .delete(authorize(), ReportController.deleteReport);

router.put(
  "/report/:report_id/:status",
  authorize(),
  ReportController.updateReportStatus
);

router.post(
  "/report/nearest/:latitude/:longitude",
  authorize(),
  ReportController.getNearestProperty
);

module.exports = router;
