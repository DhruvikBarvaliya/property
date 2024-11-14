const PropertyModel = require("../Models/PropertyModel");
const XLSX = require("xlsx");

module.exports = {
  addProperty: async (req, res) => {
    try {
      const propertys = await PropertyModel.findOne({
        address: req.body.address,
      });
      if (propertys) {
        return res.status(400).json({
          status: false,
          message: "Address already exists",
          data: propertys,
        });
      }
      const propertyData = new PropertyModel(req.body);
      await propertyData.save();
      res.status(201).json({ message: "Property Added Successfully" });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  addManyProperty: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetNames = workbook.SheetNames;

      // let allProperties = [];
      let properties;
      sheetNames.forEach(async (sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        properties = data.map((item) => ({
          ...item,
          location: {
            type: "Point",
            coordinates: [item.latitude, item.longitude],
          },
        }));
        await PropertyModel.insertMany(properties);

        // allProperties = allProperties.concat(properties);
      });

      // const existingAddresses = await PropertyModel.find({
      //   address: { $in: allProperties.map((property) => property.address) },
      // }).select("address");

      // const existingAddressSet = new Set(
      //   existingAddresses.map((property) => property.address)
      // );

      // const newProperties = allProperties.filter(
      //   (property) => !existingAddressSet.has(property.address)
      // );

      // if (newProperties.length === 0) {
      //   return res
      //     .status(400)
      //     .json({
      //       message: "No new properties to insert, all addresses already exist",
      //     });
      // }

      // await PropertyModel.insertMany(properties);
      res.status(200).json({ message: "Properties inserted successfully" });
    } catch (err) {
      res.status(500).json({
        error: "An error occurred while inserting data",
        details: err.message,
      });
    }
  },

  getAllProperty: async (req, res) => {
    try {
      const { limit = 10, skip = 0, isPagination } = req.query;
      const total = await PropertyModel.countDocuments();

      let allProperty;
      if (isPagination == "false") {
        allProperty = await PropertyModel.find({ is_active: true }).sort({
          createdAt: -1,
        });
        return res.status(200).json({
          status: true,
          total,
          length: allProperty.length,
          message: "Property Get Successfully",
          allProperty,
        });
      }
      // const { limit = 10, skip = 0 } = req.query;
      allProperty = await PropertyModel.find({ is_active: true })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip));

      if (!allProperty.length) {
        return res
          .status(404)
          .json({ status: false, message: "Property Not Found In Database" });
      }

      res.status(200).json({
        status: true,
        total,
        length: allProperty.length,
        message: "Property Get Successfully",
        allProperty,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getPropertyById: async (req, res) => {
    try {
      const property = await PropertyModel.findOne({
        _id: req.params.property_id,
        is_active: true,
      });
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      res
        .status(200)
        .json({ status: true, message: "Property Get Successfully", property });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getNearestProperty: async (req, res) => {
    const { latitude, longitude } = req.params;
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    if (isNaN(lat) || isNaN(long)) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude provided" });
    }

    try {
      const nearestProperties = await PropertyModel.find({
        location: {
          $near: {
            $maxDistance: 100,
            $minDistance: 0,
            $geometry: {
              type: "Point",
              coordinates: [lat, long],
            },
          },
        },
      });

      if (!nearestProperties.length) {
        return res
          .status(404)
          .json({ message: "No properties found within the specified range" });
      }

      res.status(200).json({
        status: true,
        message: "Nearest properties fetched successfully",
        nearestProperties,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "An error occurred while fetching nearest properties",
        details: err.message,
      });
    }
  },

  // searchProperty: async (req, res) => {
  //   try {
  //     const properties = await PropertyModel.find({
  //       address: {
  //         $regex: req.params.title,
  //         $options: "i",
  //       },
  //     });

  //     res.status(200).json({
  //       status: true,
  //       message: "Property Get Successfully",
  //       properties,
  //     });
  //   } catch (err) {
  //     res.status(500).json({
  //       status: false,
  //       message: "Server Error",
  //       error: err.message || err.toString(),
  //     });
  //   }
  // },
  searchProperty: async (req, res) => {
    try {
      const { limit = 10, skip = 0, keyword, latitude, longitude } = req.query;

      let latitudeNumber = parseFloat(latitude);
      let longitudeNumber = parseFloat(longitude);

      let locationQuery = {};
      if (!isNaN(latitudeNumber) && !isNaN(longitudeNumber)) {
        locationQuery = {
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [latitudeNumber, longitudeNumber],
              },
              $maxDistance: 10000, // Adjust the distance in meters if necessary
            },
          },
        };
      }

      const regex = new RegExp(keyword, "i");
      const allProperty = await PropertyModel.find({
        $or: [
          { address: { $regex: regex } },
          { type_of_property: { $regex: regex } },
          // locationQuery,
        ],
      })
        .limit(Number(limit))
        .skip(Number(skip));

      const total = await PropertyModel.countDocuments({
        $or: [
          { address: { $regex: regex } },
          { type_of_property: { $regex: regex } },
          // locationQuery,
        ],
      });
      if (!allProperty.length) {
        return res
          .status(404)
          .json({ status: false, message: "No Property found." });
      }

      res.status(200).json({
        status: true,
        total,
        length: allProperty.length,
        message: "Property Get Successfully",
        allProperty,
      });
    } catch (err) {
      res.status(500).json({
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
      res
        .status(200)
        .json({ status: true, message: "Property Updated Successfully" });
    } catch (err) {
      res.status(500).json({
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
        { is_active: req.params.status },
        { new: true }
      );
      if (!property) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${req.params.property_id}`,
        });
      }
      res.status(200).json({
        status: true,
        message: "Property Status Updated Successfully",
        property,
      });
    } catch (err) {
      res.status(500).json({
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
      res
        .status(200)
        .json({ status: true, message: "Property Deleted Successfully" });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
