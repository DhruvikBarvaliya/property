const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const Role = require("../Helpers/role");
const PropertyController = require("../Controllers/PropertyController");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/property",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PropertyController.addProperty
);

router.post(
  "/upload",upload.single('file'),
  PropertyController.addManyProperty
);

router.get("/property", PropertyController.getAllProperty);
router.get(
  "/property/byPropertyId/:property_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE]),
  PropertyController.getPropertyById
);
router.get(
  "/property/byRole/:role",
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE]),
  PropertyController.getPropertyById
);
router.get(
  "/property/searchProperty/:title",
  // authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE]),
  PropertyController.searchProperty
);
router.put(
  "/property/:property_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE]),
  PropertyController.updateProperty
);
router.put(
  "/property/:property_id/:status",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PropertyController.updatePropertyStatus
);
router.delete(
  "/property/:property_id",
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PropertyController.deleteProperty
);

module.exports = router;
