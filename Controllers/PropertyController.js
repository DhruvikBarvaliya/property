const PropertyModel = require("../Models/PropertyModel");
const XLSX = require("xlsx");

module.exports = {
  addProperty: async (req, res) => {
    try {
      const propertyData = new PropertyModel(req.body);
      await propertyData.save();
      return res.status(201).json({ message: "Property Added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  addManyProperty: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const properties = data.map((item) => ({
        ...item,
        location: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
      }));

      await PropertyModel.insertMany(properties);
      res.status(200).json({ message: "Properties inserted successfully" });
    } catch (err) {
      res
        .status(500)
        .json({
          error: "An error occurred while inserting data",
          details: err.message,
        });
    }
  },

  getAllProperty: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0);
      const allProperty = await PropertyModel.find()
        .sort({ percentage: -1 })
        .limit(limit)
        .skip(skip);
      const total = await PropertyModel.count();

      if (!allProperty.length) {
        return res
          .status(404)
          .json({ status: false, message: "Property Not Found In Database" });
      }

      return res.status(200).json({
        status: true,
        total,
        length: allProperty.length,
        message: "Property Get Successfully",
        allProperty,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getPropertyById: async (req, res) => {
    try {
      const property = await PropertyModel.findById(req.params.property_id);
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Property Get Successfully", property });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getNearestProperty: async (req, res) => {
    try {
      const { latitude, longitude } = req.params;
      const lat = parseFloat(latitude);
      const long = parseFloat(longitude);
      if (isNaN(lat) || isNaN(long)) {
        return res
          .status(400)
          .json({ error: "Invalid latitude or longitude provided" });
      }

      const nearestProperties = await PropertyModel.find({
        location: {
          $near: {
              $maxDistance: 100,
              $minDistance: 0,
              $geometry: {
                  type: "Point",
                  coordinates: [lat, long]
              }
          }
      }
      });

      if (!nearestProperties.length) {
        return res
          .status(404)
          .json({ message: "No properties found within the specified range" });
      }

      res
        .status(200)
        .json({
          status: true,
          message: "Nearest properties fetched successfully",
          nearestProperties,
        });
    } catch (err) {
      res
        .status(500)
        .json({
          status: false,
          error: "An error occurred while fetching nearest properties",
          details: err.message,
        });
    }
  },

  searchProperty: async (req, res) => {
    try {
      const properties = await PropertyModel.find({
        postal_address_of_the_property: {
          $regex: req.params.title,
          $options: "i",
        },
      });

      return res.status(200).json({
        status: true,
        message: "Property Get Successfully",
        properties,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  updateProperty: async (req, res) => {
    try {
      const property = await PropertyModel.findByIdAndUpdate(
        req.params.property_id,
        req.body,
        { new: true }
      );
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Property Updated Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  updatePropertyStatus: async (req, res) => {
    try {
      const property = await PropertyModel.findByIdAndUpdate(
        req.params.property_id,
        { is_active: req.params.is_active },
        { new: true }
      );
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "Property Status Updated Successfully",
        property,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  deleteProperty: async (req, res) => {
    try {
      const property = await PropertyModel.findByIdAndUpdate(
        req.params.property_id,
        { is_active: false },
        { new: true }
      );
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Property Deleted Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
