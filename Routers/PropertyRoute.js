const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/auth");
const PropertyController = require("../Controllers/PropertyController");
const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({ dest: "uploads/" });

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
router.get("/property/search", authorize(), PropertyController.searchProperty);

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

module.exports = router;
