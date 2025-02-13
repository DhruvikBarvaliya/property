const ReportModel = require("../Models/ReportModel");
const PropertyModel = require("../Models/PropertyModel");
const UnListedPropertyModel = require("../Models/UnListedPropertyModel");
const UserModel = require("../Models/UserModel");
const { numberToWords } = require("../Helpers/NumToWord");

let { maxDistance, minDistance } = require("../Config/Config");

async function calculatePrice(years) {
  if (years >= 1 && years <= 10) {
    return 1200;
  } else if (years >= 11 && years <= 20) {
    return 1100;
  } else if (years >= 21 && years <= 30) {
    return 1000;
  } else if (years >= 31) {
    return 900;
  } else {
    return "Invalid input";
  }
}

function getFinancialYear() {
  const now = new Date();
  const month = now.getMonth(); // 0 = January, 1 = February, ..., 11 = December
  const year = now.getFullYear();

  // Determine the financial year and the corresponding start year
  const startYear = month >= 3 ? year : year - 1; // Financial year starts in April (month index 3)
  const endYear = startYear + 1;

  // Format the financial year as `yyyy-yy`
  const financialYear = `${startYear}-${endYear.toString().slice(-2)}`;

  // Format month as `MM`
  const formattedMonth = (month + 1).toString().padStart(2, "0"); // +1 because getMonth() is zero-indexed

  return `DV/SRT/${financialYear}/${formattedMonth}`;
}
let number;
async function generateUniqueID() {
  const prefix = `${getFinancialYear()}`;
  const latestReport = await ReportModel.findOne().sort({ createdAt: -1 });
  const lastSlashIndex = latestReport?.case_ref_no?.lastIndexOf("/") || 0;
  if (lastSlashIndex === 0) {
    number = 1;
  } else {
    number = parseInt(latestReport.case_ref_no.slice(lastSlashIndex + 1)) + 1;
  }
  return `${prefix}/${number}`;
}

async function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${day}-${month}-${year}`;
}

module.exports = {
  getNearestProperty: async (req, res) => {
    let {
      user_id,
      latitude,
      longitude,
      owner_name,
      owner_address,
      address,
      distance,
      type_of_property,
      carpet_area,
      super_built_up_area,
      land_area,
      construction_area,
      age_of_property,
      type,
      no_of_floor,
      floor_of_unit,
      flat_no,
      house_no,
      loading,
      land_location,
    } = req.body;
    const currentDate = new Date();
    const reportDate = await formatDate(currentDate);

    let splitAddtess = address.split(" ");
    let landmark = splitAddtess.slice(-3).join(" ");

    let reportObj = {
      latitude,
      longitude,
      distance,
      name_of_the_customers: "-",
      owner_name,
      owner_address,
      report_date: reportDate,
      case_ref_no: await generateUniqueID(),
      property_address: address,
      nearest_landmark: landmark,
      property_land_area: "-",
      built_up_area_carpet_area_super_built_up_area: "-",
      land_value: "-",
      type_of_property: "-",
      unit_rate_considered_for_land: "-",
      unit_rate_considered_for_ca_bua_sba: "-",
      building_value: "-",
      final_valuation: "-",
      final_valuation_in_word: "-",
      land_location,
    };
    let MaxDistance = distance || maxDistance;

    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    const usarData = await UserModel.findOne({
      _id: user_id,
      is_active: true,
    }).select(
      "-password -module -is_verified -is_active -login_attempts -is_paid -no_of_pdf -createdAt -updatedAt"
    );
    if (!usarData) {
      return res.status(404).json({
        status: false,
        message: `User not found with ID: ${user_id}`,
      });
    }
    let name = usarData.name;
    let noOfReport = usarData.no_of_report - 1;
    let user_role = usarData.role;

    if (isNaN(lat) || isNaN(long)) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude provided" });
    }
    let propertyTypes = [];
    if (type_of_property == "Apartment") {
      propertyTypes.push("Residential Flat ", "Residential Flat");
      // propertyTypes.push("Residential Flat ", "Commercial Shop ", "Office ");
    } else if (type_of_property == "Independent") {
      propertyTypes.push(
        "Residential Plot ",
        "Residential House ",
        "Industrial Plot ",
        "Residential Plot",
        "Residential House",
        "Industrial Plot"
      );
    } else if (type_of_property == "Commercial") {
      propertyTypes.push(
        "Commercial Shop",
        "Office",
        "Commercial Shop ",
        "Office "
      );
    } else {
      propertyTypes.push(
        "Agricultural Land ",
        "NA Land ",
        "Agricultural Land",
        "NA Land"
      );
    }

    try {
      const nearestProperties = await PropertyModel.find({
        type_of_property: { $in: propertyTypes },
        location: {
          $near: {
            $maxDistance: MaxDistance,
            $minDistance: minDistance,
            $geometry: {
              type: "Point",
              coordinates: [lat, long],
            },
          },
        },
      });

      if (!nearestProperties.length) {
        const unListedProperty = new UnListedPropertyModel({
          user_id,
          latitude,
          longitude,
          owner_name,
          owner_address,
          address,
          distance,
          type_of_property,
          carpet_area,
          super_built_up_area,
          land_area,
          construction_area,
          age_of_property,
          type,
          no_of_floor,
          floor_of_unit,
          flat_no,
          house_no,
          loading,
        });
        const existingProperty = await UnListedPropertyModel.findOne({
          address: address,
        });
        if (!existingProperty) {
          await unListedProperty.save();
          return res.status(200).json({
            message: "No properties found within the specified range",
          });
        }
        if (nearestProperties) {
          return res.status(200).json({
            message: "No properties found within the specified range",
          });
        }
      }

      let market_area;

      if (type_of_property == "Apartment") {
        let uniqueNearestProperties = [];
        let seenAddresses = new Set();

        for (let property of nearestProperties) {
          if (!seenAddresses.has(property.area_rate_considered_per_sq_ft)) {
            uniqueNearestProperties.push(property);
            seenAddresses.add(property.area_rate_considered_per_sq_ft);
          }
          if (uniqueNearestProperties.length >= 5) break;
        }

        let totalRate = 0;
        seenAddresses.forEach((rate) => {
          totalRate += parseInt(rate);
        });
        let area_per_sq_ft = totalRate / seenAddresses.size;

        console.log("Unique Nearest Properties Top 5", uniqueNearestProperties);
        console.log("Top 5 Rate", seenAddresses);
        console.log("Average Rate:", area_per_sq_ft);

        if ((!carpet_area && !super_built_up_area) || !address) {
          return res.status(404).json({
            status: false,
            message: "carpet_area or super_built_up_area And address Not Found",
          });
        }

        if (floor_of_unit > 14) {
          area_per_sq_ft += 1.1 * (floor_of_unit - 1);
        }
        if (noOfReport < 0) {
          return res
            .status(400)
            .json({ error: "Please Pay for Ganarate Report" });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
          user_id,
          { no_of_report: noOfReport },
          { new: true }
        );

        if (updatedUser.no_of_report <= 0) {
          await UserModel.findByIdAndUpdate(
            user_id,
            { is_paid: false, $unset: { subscriptions_id: "" } },
            { new: true }
          );
        }

        let building_values = area_per_sq_ft * carpet_area;
        let amountInWords = await numberToWords(building_values);

        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: 0,
          built_up_area_carpet_area_super_built_up_area:
            carpet_area || super_built_up_area,
          land_value: 0,
          type_of_property: type_of_property,
          age_of_property,
          unit_rate_considered_for_land: 0,
          unit_rate_considered_for_ca_bua_sba: area_per_sq_ft.toFixed(2),
          building_value: Math.ceil(building_values / 100) * 100, // Math.round(building_values),
          final_valuation: Math.ceil(building_values / 100) * 100, //Math.round(building_values),
          RV: Math.ceil((building_values * 0.9) / 100) * 100, // Math.round(building_values * 0.9),
          DV: Math.ceil((building_values * 0.75) / 100) * 100, //Math.round(building_values * 0.75),
          final_valuation_in_word: amountInWords,
          carpet_area,
          super_built_up_area,
          loading,
        };
        const reportData = new ReportModel({
          ...finalObj,
          user_id,
          latitude,
          longitude,
          distance,
          address,
          type_of_property,
          carpet_area,
          super_built_up_area,
          no_of_floor,
          floor_of_unit,
          flat_no,
          loading,
          user_role,
        });

        let ReportData = await reportData.save();

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          ...finalObj,
        });
      } else if (type_of_property == "Independent") {
        let uniqueNearestProperties = [];
        let seenAddresses = new Set();

        for (let property of nearestProperties) {
          if (!seenAddresses.has(property.land_rate_per_sq_mtr_Sq_yard)) {
            uniqueNearestProperties.push(property);
            seenAddresses.add(property.land_rate_per_sq_mtr_Sq_yard);
          }
          if (uniqueNearestProperties.length >= 5) break;
        }

        let totalRate = 0;
        seenAddresses.forEach((rate) => {
          totalRate += parseInt(rate);
        });
        let plot_land_rate = totalRate / seenAddresses.size;

        console.log("Unique Nearest Properties Top 5", uniqueNearestProperties);
        console.log("Top 5 Rate", seenAddresses);
        console.log("Average Rate:", plot_land_rate);

        if (!construction_area) {
          construction_area = 0;
        }

        if (
          !age_of_property ||
          // !construction_area ||
          !type ||
          !land_area ||
          !address
        ) {
          return res.status(404).json({
            status: false,
            message: "Required fields not found for Independent property",
          });
        }

        const construction_rate = await calculatePrice(age_of_property);

        const construction_cost = construction_area * construction_rate;
        const typeValue = type == "House" ? 60 : 50;
        let depreciation;
        let building_value;
        let final_valuation;
        if (age_of_property > 5) {
          depreciation =
            (construction_cost * age_of_property * 0.9) / typeValue;

          final_valuation = construction_cost - depreciation;
          building_value = final_valuation + plot_land_rate * land_area;
        } else {
          depreciation = construction_cost + plot_land_rate * land_area;
          building_value = depreciation;
          final_valuation = construction_cost;
        }

        market_area = land_area * plot_land_rate + depreciation;

        let amountInWords = await numberToWords(market_area);

        if (noOfReport < 0) {
          return res
            .status(400)
            .json({ error: "Please Pay for Ganarate Report" });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
          user_id,
          { no_of_report: noOfReport },
          { new: true }
        );
        if (updatedUser.no_of_report <= 0) {
          await UserModel.findByIdAndUpdate(
            user_id,
            { is_paid: false, $unset: { subscriptions_id: "" } },
            { new: true }
          );
        }
        let final_value = building_value;
        amountInWords = await numberToWords(final_value);
        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: land_area,
          built_up_area_carpet_area_super_built_up_area: construction_area,
          land_value: Math.ceil((plot_land_rate * land_area) / 100) * 100, //Math.round(plot_land_rate * land_area),
          type_of_property: type_of_property,
          age_of_property,
          unit_rate_considered_for_land: plot_land_rate,
          unit_rate_considered_for_ca_bua_sba: construction_rate,
          building_value: Math.ceil(final_valuation / 100) * 100, //Math.round(final_valuation),
          final_valuation: Math.ceil(final_value / 100) * 100, //Math.round(final_value),
          final_valuation_in_word: amountInWords,
          RV: Math.ceil((building_value * 0.9) / 100) * 100, //Math.round(building_value * 0.9),
          DV: Math.ceil((building_value * 0.75) / 100) * 100, //Math.round(building_value * 0.75),
        };
        const reportData = new ReportModel({
          ...finalObj,
          user_id,
          latitude,
          longitude,
          distance,
          address,
          type_of_property,
          land_area,
          construction_area,
          age_of_property,
          type,
          house_no,
          user_role,
        });
        let ReportData = await reportData.save();

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          land_area,
          plot_land_rate,
          construction_cost,
          depreciation,
          ...finalObj,
        });
      } else if (type_of_property == "Commercial") {
        let uniqueNearestProperties = [];
        let seenAddresses = new Set();

        for (let property of nearestProperties) {
          if (!seenAddresses.has(property.area_rate_considered_per_sq_ft)) {
            uniqueNearestProperties.push(property);
            seenAddresses.add(property.area_rate_considered_per_sq_ft);
          }
          if (uniqueNearestProperties.length >= 5) break;
        }

        let totalRate = 0;
        seenAddresses.forEach((rate) => {
          totalRate += parseInt(rate);
        });
        let area_per_sq_ft = totalRate / seenAddresses.size;

        console.log("Unique Nearest Properties Top 5", uniqueNearestProperties);
        console.log("Top 5 Rate", seenAddresses);
        console.log("Average Rate:", area_per_sq_ft);

        if ((!carpet_area && !super_built_up_area) || !address) {
          return res.status(404).json({
            status: false,
            message: "carpet_area or super_built_up_area And address Not Found",
          });
        }

        if (floor_of_unit == 1) {
          area_per_sq_ft *= 0.65;
        } else if (floor_of_unit == 2) {
          area_per_sq_ft *= 0.5;
        } else if (floor_of_unit == 3) {
          area_per_sq_ft *= 0.4;
        } else if (floor_of_unit > 3) {
          area_per_sq_ft *= 0.35;
        }
        if (noOfReport < 0) {
          return res
            .status(400)
            .json({ error: "Please Pay for Ganarate Report" });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
          user_id,
          { no_of_report: noOfReport },
          { new: true }
        );
        if (updatedUser.no_of_report <= 0) {
          await UserModel.findByIdAndUpdate(
            user_id,
            { is_paid: false, $unset: { subscriptions_id: "" } },
            { new: true }
          );
        }

        let building_values = area_per_sq_ft * carpet_area;
        let amountInWords = await numberToWords(building_values);

        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: 0,
          built_up_area_carpet_area_super_built_up_area:
            carpet_area || super_built_up_area,
          land_value: 0,
          type_of_property: type_of_property,
          age_of_property,
          unit_rate_considered_for_land: 0,
          unit_rate_considered_for_ca_bua_sba: area_per_sq_ft.toFixed(2),
          building_value: Math.ceil(building_values / 100) * 100, //Math.round(building_values),
          final_valuation: Math.ceil(building_values / 100) * 100, //Math.round(building_values),
          RV: Math.ceil((building_values * 0.9) / 100) * 100, //Math.round(building_values * 0.9),
          DV: Math.ceil((building_values * 0.75) / 100) * 100, //Math.round(building_values * 0.75),
          final_valuation_in_word: amountInWords,
          carpet_area,
          super_built_up_area,
          loading,
        };
        const reportData = new ReportModel({
          ...finalObj,
          user_id,
          latitude,
          longitude,
          distance,
          address,
          type_of_property,
          carpet_area,
          super_built_up_area,
          no_of_floor,
          floor_of_unit,
          flat_no,
          loading,
          user_role,
        });

        let ReportData = await reportData.save();

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          ...finalObj,
        });
      } else if (type_of_property == "Land") {
        let uniqueNearestProperties = [];
        let seenAddresses = new Set();

        for (let property of nearestProperties) {
          if (!seenAddresses.has(property.land_rate_per_sq_mtr_Sq_yard)) {
            uniqueNearestProperties.push(property);
            seenAddresses.add(property.land_rate_per_sq_mtr_Sq_yard);
          }
          if (uniqueNearestProperties.length >= 5) break;
        }

        let totalRate = 0;
        seenAddresses.forEach((rate) => {
          totalRate += parseInt(rate);
        });
        let average = totalRate / seenAddresses.size;

        console.log("Unique Nearest Properties Top 5", uniqueNearestProperties);
        console.log("Top 5 Rate", seenAddresses);
        console.log("Average Rate:", average);

        if (!land_area) {
          return res
            .status(404)
            .json({ status: false, message: "land_area Not Found" });
        }

        market_area = land_area * average;

        const amountInWords = await numberToWords(market_area);

        if (noOfReport < 0) {
          return res
            .status(400)
            .json({ error: "Please Pay for Ganarate Report" });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
          user_id,
          { no_of_report: noOfReport },
          { new: true }
        );
        if (updatedUser.no_of_report <= 0) {
          await UserModel.findByIdAndUpdate(
            user_id,
            { is_paid: false, $unset: { subscriptions_id: "" } },
            { new: true }
          );
        }

        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: land_area,
          built_up_area_carpet_area_super_built_up_area: 0,
          land_value: Math.ceil(market_area / 100) * 100, //Math.round(market_area),
          type_of_property: type_of_property,
          unit_rate_considered_for_land: average,
          unit_rate_considered_for_ca_bua_sba: 0,
          building_value: 0,
          final_valuation: Math.ceil(market_area / 100) * 100, //Math.round(market_area),
          final_valuation_in_word: amountInWords,
          RV: Math.ceil((market_area * 0.9) / 100) * 100, //Math.round(market_area * 0.9),
          DV: Math.ceil((market_area * 0.75) / 100) * 100, //Math.round(market_area * 0.75),
        };
        const reportData = new ReportModel({
          ...finalObj,
          user_id,
          latitude,
          longitude,
          distance,
          address,
          type_of_property,
          land_area,
          user_role,
        });
        let ReportData = await reportData.save();

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          land_area,
          average,
          ...finalObj,
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Please select a valid property type",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "An error occurred while fetching nearest properties",
        details: err.message,
      });
    }
  },
  addReport: async (req, res) => {
    try {
      const { report } = req.body;
      if (!report) {
        return res.status(400).json({
          status: false,
          message: `Report Object is Required`,
        });
      }
      const reportData = new ReportModel({ report });
      await reportData.save();
      return res
        .status(201)
        .json({ message: "Report Object added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllReport: async (req, res) => {
    try {
      const allReport = await ReportModel.find().sort({ createdAt: -1 });
      if (!allReport.length) {
        return res
          .status(404)
          .json({ status: false, message: "Report Not Found In Database" });
      }
      return res.status(200).json({
        status: true,
        message: "Reports Retrieved Successfully",
        allReport,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getReportById: async (req, res) => {
    try {
      const { report_id } = req.params;
      const report = await ReportModel.findById(report_id);
      if (!report) {
        return res.status(404).json({
          status: false,
          message: `Report Not Found With ID: ${report_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "Report Retrieved Successfully",
        report,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getReportByUserId: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { limit = 10, skip = 0 } = req.query;
      const reports = await ReportModel.find({ user_id: user_id }).sort({
        createdAt: -1,
      });
      // .limit(Number(limit))
      // .skip(Number(skip));
      const report = reports
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.address === item.address)
        )
        .slice(Number(skip), Number(skip) + Number(limit));

      const reportLen = reports.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.address === item.address)
      );

      const total = await ReportModel.find({
        user_id: user_id,
      }).countDocuments();

      if (reports.length == 0) {
        return res.status(404).json({
          status: false,
          message: `Report Not Found For User ID: ${user_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "Report Retrieved Successfully",
        length: report.length,
        total: reportLen.length,
        report,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getNoOfReportByUserId: async (req, res) => {
    try {
      const { user_id } = req.params;
      const total = await ReportModel.find({
        user_id: user_id,
      }).countDocuments();
      return res.status(200).json({
        status: true,
        message: "No of Report Retrieved Successfully",
        total,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateReport: async (req, res) => {
    try {
      const { report_id } = req.params;
      const report = await ReportModel.findByIdAndUpdate(report_id, req.body, {
        new: true,
      });
      if (!report) {
        return res.status(404).json({
          status: false,
          message: `Report Not Found With ID: ${report_id}`,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Report Updated Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateReportStatus: async (req, res) => {
    try {
      const { report_id, status } = req.params;
      const report = await ReportModel.findByIdAndUpdate(
        report_id,
        { is_active: status },
        { new: true }
      );
      if (!report) {
        return res.status(404).json({
          status: false,
          message: `Report Not Found With ID: ${report_id}`,
        });
      }
      return res.status(200).json({
        status: true,
        message: "Report Status Updated Successfully",
        report,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteReport: async (req, res) => {
    try {
      const { report_id } = req.params;
      const report = await ReportModel.findByIdAndUpdate(
        report_id,
        { is_active: false },
        { new: true }
      );
      if (!report) {
        return res.status(404).json({
          status: false,
          message: `Report Not Found With ID: ${report_id}`,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "Report Deleted Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getIdAndTime: async (req, res) => {
    try {
      const { input_id } = req.params;

      const delimiter = "OF";
      const [id, timeWithExtension] = input_id.split(delimiter);

      // Remove any leading/trailing spaces
      const cleanedId = id.trim();

      // Extract the time without the file extension
      const time = timeWithExtension.replace(/\.(docx|pdf)$/i, "").trim();

      return res.status(200).json({
        status: true,
        message: "Server Error",
        id: cleanedId,
        time: time,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getListOfReportGeneratedByIndividual: async (req, res) => {
    try {
      const { limit = 10, skip = 0 } = req.query;
      const reports = await ReportModel.find({ user_role: "INDIVIDUAL" })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip));

      const total = await ReportModel.find({
        user_role: "INDIVIDUAL",
      }).countDocuments();

      if (reports.length === 0) {
        return res.status(404).json({
          status: false,
          message: `No reports found for user type INDIVIDUAL`,
        });
      }

      return res.status(200).json({
        status: true,
        message: "Reports retrieved successfully",
        length: reports.length,
        total,
        reports,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  searchReport: async (req, res) => {
    const { keyword, limit, skip } = req.query;

    try {
      const regex = new RegExp(keyword, "i");

      const reports = await ReportModel.find({
        $or: [
          { name_of_the_customers: { $regex: regex } },
          { owner_name: { $regex: regex } },
          { report_date: { $regex: regex } },
          { case_ref_no: { $regex: regex } },
          { property_address: { $regex: regex } },
          { nearest_landmark: { $regex: regex } },
          { type_of_property: { $regex: regex } },
          { final_valuation_in_word: { $regex: regex } },
        ],
      })
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .limit(parseInt(limit)) // Limit for pagination
        .skip(parseInt(skip)); // Skip for pagination

      const total = await ReportModel.countDocuments({
        $or: [
          { name_of_the_customers: { $regex: regex } },
          { owner_name: { $regex: regex } },
          { report_date: { $regex: regex } },
          { case_ref_no: { $regex: regex } },
          { property_address: { $regex: regex } },
          { nearest_landmark: { $regex: regex } },
          { type_of_property: { $regex: regex } },
          { final_valuation_in_word: { $regex: regex } },
        ],
      });

      if (!reports.length) {
        return res.status(404).json({
          status: false,
          message: "No reports found.",
        });
      }

      return res.status(200).json({
        status: true,
        total,
        length: reports.length,
        message: "Reports retrieved successfully.",
        reports,
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
