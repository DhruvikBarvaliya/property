const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const ConfigController = require("../Controllers/ConfigController");

router.post(
  "/config", authorize(),
  ConfigController.addConfig
);
router.get("/config", authorize(), ConfigController.getAllConfig);
router.get(
  "/config/byConfigId/:config_id",
  authorize(),
  ConfigController.getConfigById
);

router.put(
  "/config/:config_id",
  authorize(),
  ConfigController.updateConfig
);
router.put(
  "/config/:config_id/:status",
  authorize(),
  ConfigController.updateConfigStatus
);
router.delete(
  "/config/:config_id",
  authorize(),
  ConfigController.deleteConfig
);

module.exports = router;
