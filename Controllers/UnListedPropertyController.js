const UnListedPropertyModel = require("../Models/UnListedPropertyModel");

module.exports = {
  addUnListedProperty: async (req, res) => {
    try {
      // const {
      //   user_id,
      //   latitude,
      //   longitude,
      //   address,
      //   distance,
      //   type_of_property,
      //   carpet_area,
      //   super_built_up_area,
      //   land_area,
      //   construction_area,
      //   age_of_property,
      //   type,
      //   no_of_floor,
      //   floor_of_unit,
      //   flat_no,
      //   house_no,
      //   loading,
      //   is_active,
      // } = req.body;
      // if (!razorpay_api_key) {
      //   return res.status(400).json({
      //     status: false,
      //     message: `unListedProperty_${!unListedProperty_id ? "id" : "response"} is Required`,
      //   });
      // }
      const unListedPropertyData = new UnListedPropertyModel(req.body);
      await unListedPropertyData.save();
      return res
        .status(201)
        .json({ message: "UnListedProperty response added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllUnListedProperty: async (req, res) => {
    try {
      const allUnListedProperty = await UnListedPropertyModel.find({
        is_active: true,
      }).sort({
        createdAt: 1,
      });
      if (!allUnListedProperty.length) {
        return res.status(404).json({
          status: false,
          message: "UnListedProperty Not Found In Database",
        });
      }
      return res.status(200).json({
        status: true,
        message: "UnListedProperty Retrieved Successfully",
        allUnListedProperty,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getUnListedPropertyById: async (req, res) => {
    try {
      const { unListedProperty_id } = req.params;
      const unListedProperty = await UnListedPropertyModel.findOne({
        _id: unListedProperty_id,
        is_active: true,
      });
      if (!unListedProperty) {
        return res.status(404).json({
          status: false,
          message: `UnListedProperty Not Found With ID: ${unListedProperty_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "UnListedProperty Retrieved Successfully",
        unListedProperty,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUnListedProperty: async (req, res) => {
    try {
      const { unListedProperty_id } = req.params;
      const unListedProperty = await UnListedPropertyModel.findByIdAndUpdate(
        unListedProperty_id,
        req.body,
        {
          new: true,
        }
      );
      if (!unListedProperty) {
        return res.status(404).json({
          status: false,
          message: `UnListedProperty Not Found With ID: ${unListedProperty_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "UnListedProperty Updated Successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateUnListedPropertyStatus: async (req, res) => {
    try {
      const { unListedProperty_id, status } = req.params;
      const unListedProperty = await UnListedPropertyModel.findByIdAndUpdate(
        unListedProperty_id,
        { is_active: status },
        { new: true }
      );
      if (!unListedProperty) {
        return res.status(404).json({
          status: false,
          message: `UnListedProperty Not Found With ID: ${unListedProperty_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "UnListedProperty Status Updated Successfully",
        unListedProperty,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteUnListedProperty: async (req, res) => {
    try {
      const { unListedProperty_id } = req.params;
      const unListedProperty = await UnListedPropertyModel.findByIdAndUpdate(
        unListedProperty_id,
        { is_active: false },
        { new: true }
      );
      if (!unListedProperty) {
        return res.status(404).json({
          status: false,
          message: `UnListedProperty Not Found With ID: ${unListedProperty_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "UnListedProperty Deleted Successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
