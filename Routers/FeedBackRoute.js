const express = require("express");
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const FeedbackController = require("../Controllers/FeedBackController");

const router = express.Router();

// Create a new feedback
router.post("/feedBack", authorize(), FeedbackController.createFeedback);

// Retrieve all feedbacks
router.get("/feedBack", authorize(), FeedbackController.getAllFeedbacks);

router.get(
  "/feedBack/search",
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  FeedbackController.searchFeedBack
);

// Retrieve a single feedback by id
router.get("/feedBack/:feedBack_id", authorize(), FeedbackController.getFeedbackById);

// Update a feedback by id
router.put("/feedBack/:feedBack_id", authorize(), FeedbackController.updateFeedback);

router.put(
  "/feedBack/:feedBack_id/:status",
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  FeedbackController.feedBackStatus
);

// Delete a feedback by id
router.delete("/feedBack/:feedBack_id", authorize(), FeedbackController.deleteFeedback);

module.exports = router;
