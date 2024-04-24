const PropertyModel = require("../Models/PropertyModel");
const XLSX = require('xlsx');
module.exports = {
  addProperty: async (req, res) => {
    try {
      const { time,
        type_of_property,
        postal_address_of_the_property,
        latitude_longitude,
        property_sub_classification,
        age_of_the_property,
        type_of_construction,
        land_area_sq_mtr_sq_yrd,
        land_rate_per_sq_mtr_Sq_yard,
        construction_area_sq_ft_built_up_area,
        area_rate_considered_per_sq_ft,
        built_up_area,
        super_built_up_area,
        carpet_area,
        area_rate_considered_on,
        construction_area_sq_ft_super_uilt_area,
        construction_area_sq_ft_row_1,
        construction_area_sq_ft_super_built_up_area } =
        req.body;

      const propertyData = new PropertyModel({
        time,
        type_of_property,
        postal_address_of_the_property,
        latitude_longitude,
        property_sub_classification,
        age_of_the_property,
        type_of_construction,
        land_area_sq_mtr_sq_yrd,
        land_rate_per_sq_mtr_Sq_yard,
        construction_area_sq_ft_built_up_area,
        area_rate_considered_per_sq_ft,
        built_up_area,
        super_built_up_area,
        carpet_area,
        area_rate_considered_on,
        construction_area_sq_ft_super_uilt_area,
        construction_area_sq_ft_row_1,
        construction_area_sq_ft_super_built_up_area
      });
      propertyData
        .save()
        .then((data) => {
          return res
            .status(201)
            .json({ message: "Property Added Successfully" });
        })

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
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet);
      PropertyModel.insertMany(data)
        .then(() => {
          res.status(200).json({ message: 'Property inserted successfully' });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: 'An error occurred while inserting data' });
        });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },

  getAllProperty: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0)
      let allProperty = await PropertyModel.find().sort({ percentage: -1 }).limit(limit).skip(skip);
      const total = await PropertyModel.find().count();


      if (allProperty.length == 0) {
        return res
          .status(404)
          .json({ status: false, message: `Property Not Found In Database` });
      }

      return res.status(200).json({
        status: true, total, length: allProperty.length,
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
      const { property_id } = req.params;
      const property = await PropertyModel.findById({ _id: property_id });
      if (property == null) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${property_id} `,
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

  searchProperty: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0)
      const { title } = req.params;
      const properties = await PropertyModel.find({
        postal_address_of_the_property: { $regex: title, $options: 'i' } // Case-insensitive search using regular expression
      }).limit(limit).skip(skip);
      const total = await PropertyModel.find({
        postal_address_of_the_property: { $regex: title, $options: 'i' } // Case-insensitive search using regular expression
      }).count();

      return res.status(200).json({
        status: true, total, length: properties.length,
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
      const { property_id } = req.params;

      const property = await PropertyModel.findByIdAndUpdate(
        { _id: property_id },
        req.body,
        { new: true }
      );
      if (property == null) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${property_id} `,
          property,
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
      const { property_id, is_active } = req.params;
      const property = await PropertyModel.findByIdAndUpdate(
        { _id: property_id },
        { $set: { is_active: is_active } },
        { new: true }
      );
      if (property == null) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${property_id} `,
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
      const { property_id } = req.params;
      const property = await PropertyModel.findByIdAndUpdate(
        { _id: property_id },
        { $set: { is_active: false } },
        { new: true }
      );
      if (property == null) {
        return res.status(404).json({
          status: false,
          message: `Property Not Found With ID :- ${property_id} `,
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
