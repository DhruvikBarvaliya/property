const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const ConfigController = require("../Controllers/ConfigController");

// Simplify route definitions by using route chaining
router
  .route("/config")
  .post(authorize([Role.SUPER_ADMIN, Role.ADMIN]), ConfigController.addConfig)
  .get(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    ConfigController.getAllConfig
  );

router
  .route("/config/:config_id")
  .get(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    ConfigController.getConfigById
  )
  .put(authorize([Role.SUPER_ADMIN, Role.ADMIN]), ConfigController.updateConfig)
  .delete(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    ConfigController.deleteConfig
  );

router.put(
  "/config/:config_id/:status",
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  ConfigController.updateConfigStatus
);

module.exports = router;
