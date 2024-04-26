const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const ConfigController = require("../Controllers/ConfigController");

// Simplify route definitions by using route chaining
router
  .route("/config")
  .post(authorize(), ConfigController.addConfig)
  .get(authorize(), ConfigController.getAllConfig);

router
  .route("/config/:config_id")
  .get(authorize(), ConfigController.getConfigById)
  .put(authorize(), ConfigController.updateConfig)
  .delete(authorize(), ConfigController.deleteConfig);

router.put(
  "/config/:config_id/:status",
  authorize(),
  ConfigController.updateConfigStatus
);

module.exports = router;
