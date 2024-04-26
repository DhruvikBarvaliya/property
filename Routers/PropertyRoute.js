const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const PropertyController = require("../Controllers/PropertyController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Simplify route definitions by grouping similar routes
router.post(
  "/upload",
  upload.single("file"),
  PropertyController.addManyProperty
);

// Property CRUD operations
router
  .route("/property")
  .post(authorize(), PropertyController.addProperty)
  .get(authorize(), PropertyController.getAllProperty);

router
  .route("/property/:property_id")
  .get(authorize(), PropertyController.getPropertyById)
  .put(authorize(), PropertyController.updateProperty)
  .delete(authorize(), PropertyController.deleteProperty);

router.put(
  "/property/:property_id/:status",
  authorize(),
  PropertyController.updatePropertyStatus
);

router.post(
  "/property/nearest/:latitude/:longitude",
  authorize(),
  PropertyController.getNearestProperty
);

router.get(
  "/property/search/:title",
  authorize(),
  PropertyController.searchProperty
);

module.exports = router;
