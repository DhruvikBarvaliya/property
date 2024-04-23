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
  authorize(),
  PropertyController.addProperty
);

router.post(
  "/upload",upload.single('file'),
  PropertyController.addManyProperty
);

router.get("/property",authorize(), PropertyController.getAllProperty);
router.get(
  "/property/byPropertyId/:property_id",
  authorize(),
  PropertyController.getPropertyById
);
router.get(
  "/property/byRole/:role",
  authorize(),
  PropertyController.getPropertyById
);
router.get(
  "/property/searchProperty/:title",
  authorize(),
  PropertyController.searchProperty
);
router.put(
  "/property/:property_id",
  authorize(),
  PropertyController.updateProperty
);
router.put(
  "/property/:property_id/:status",
  authorize(),
  PropertyController.updatePropertyStatus
);
router.delete(
  "/property/:property_id",
  authorize(),
  PropertyController.deleteProperty
);

module.exports = router;
