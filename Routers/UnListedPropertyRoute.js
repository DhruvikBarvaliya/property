const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const UnListedPropertyController = require("../Controllers/UnListedPropertyController");

// Simplify route definitions by using route chaining
router
  .route("/unListedProperty")
  .post(authorize([Role.SUPER_ADMIN, Role.ADMIN]), UnListedPropertyController.addUnListedProperty)
  .get(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    UnListedPropertyController.getAllUnListedProperty
  );

router
  .route("/unListedProperty/:unListedProperty_id")
  .get(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    UnListedPropertyController.getUnListedPropertyById
  )
  .put(authorize([Role.SUPER_ADMIN, Role.ADMIN]), UnListedPropertyController.updateUnListedProperty)
  .delete(
    authorize([Role.SUPER_ADMIN, Role.ADMIN]),
    UnListedPropertyController.deleteUnListedProperty
  );

router.put(
  "/unListedProperty/:unListedProperty_id/:status",
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  UnListedPropertyController.updateUnListedPropertyStatus
);

module.exports = router;
