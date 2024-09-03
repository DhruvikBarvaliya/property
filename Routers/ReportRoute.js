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

router
  .route("/report/input/:input_id")
  .get(authorize(), ReportController.getIdAndTime);

router
  .route("/report/byUser/:user_id")
  .get(authorize(), ReportController.getReportByUserId);

router.put(
  "/report/:report_id/:status",
  authorize(),
  ReportController.updateReportStatus
);

router.post(
  "/report/nearestLocationReport",
  authorize(),
  ReportController.getNearestProperty
);

router.get(
  "/report/list/individual",
  authorize(),
  ReportController.getListOfReportGeneratedByIndividual
);

module.exports = router;
