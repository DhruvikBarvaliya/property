const ReportModel = require("../Models/ReportModel");
const PropertyModel = require("../Models/PropertyModel");
const UserModel = require("../Models/UserModel");
const { numberToWords } = require("../Helpers/NumToWord");
const path = require("path");

let { maxDistance, minDistance } = require("../Config/Config");
const {
  replacePlaceholderInDocx,
  convertDocxToPdf,
} = require("../Helpers/convert");

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

async function generateUniqueID() {
  const prefix = "EE/VAL/SRT/LB";
  const yearRange =
    new Date().getFullYear() +
    "-" +
    (new Date().getFullYear() + 1).toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const number = String(Math.floor(Math.random() * 9000) + 1000);

  return `${prefix}/${yearRange}/${month}/${number}`;
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
      address,
      distance,
      type_of_property,
      carpet_area,
      super_built_up_area,
      land_area,
      construction_area,
      age_of_property,
      type,
    } = req.body;
    const currentDate = new Date();
    const reportDate = await formatDate(currentDate);

    let bb = address.split(" ");
    let landmark = bb.slice(-3).join(" ");

    let reportObj = {
      name_of_the_customers: "-",
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
    };
    const filePath = path.join(__dirname, "..", "Media", "demo.docx");

    // replacePlaceholderInDocx(filePath, "{myname}", "Dynamic Value");

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

    if (isNaN(lat) || isNaN(long)) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude provided" });
    }
    let propertyTypes = [];
    if (type_of_property == "Apartment") {
      propertyTypes.push("Commercial");
    } else if (type_of_property == "Independent") {
      propertyTypes.push("Residential", "Industrial");
    } else {
      propertyTypes.push("Agricultural", "Open Plot");
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
        return res.status(200).json({
          message: "No properties found within the specified range",
        });
      }

      let top5 = nearestProperties
        .sort(
          (a, b) =>
            parseInt(b.area_rate_considered_per_sq_ft) -
            parseInt(a.area_rate_considered_per_sq_ft)
        )
        .slice(0, 5);

      let sum = top5.reduce(
        (acc, obj) => acc + parseInt(obj.area_rate_considered_per_sq_ft),
        0
      );

      //area_rate_considered_per_sq_ft
      let top_area_rate = nearestProperties
        .sort(
          (a, b) =>
            parseInt(b.land_rate_per_sq_mtr_Sq_yard) -
            parseInt(a.land_rate_per_sq_mtr_Sq_yard)
        )
        .slice(0, 5);
      let top_area_rate_sum = top_area_rate.reduce(
        (acc, obj) => acc + parseInt(obj.land_rate_per_sq_mtr_Sq_yard),
        0
      );

      let market_area;

      if (type_of_property == "Apartment") {
        if ((!carpet_area && !super_built_up_area) || !address) {
          return res.status(404).json({
            status: false,
            message: "carpet_area or super_built_up_area And address Not Found",
          });
        }
        const area_per_sq_ft = sum / top5.length;
        market_area = carpet_area || super_built_up_area * area_per_sq_ft;
        const amountInWords = await numberToWords(market_area);
        const report = await ReportModel.findOne({
          type_of_property,
          carpet_area,
        });
        if (report == null) {
          if (noOfReport <= 0) {
            return res
              .status(400)
              .json({ error: "Please Pay for Ganarate Report" });
          }
          const updatedUser = await UserModel.findByIdAndUpdate(
            user_id,
            { no_of_report: noOfReport },
            { new: true }
          );
        }

        let building_values =
          top_area_rate_sum * (carpet_area || super_built_up_area);

        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: 0,
          built_up_area_carpet_area_super_built_up_area:
            carpet_area || super_built_up_area,
          land_value: 0,
          type_of_property: type_of_property,
          unit_rate_considered_for_land: 0,
          unit_rate_considered_for_ca_bua_sba: area_per_sq_ft, //area_rate_considered_per_sq_ft
          building_value: building_values, // top_area_rate_sum * super_built_up_area,
          final_valuation: market_area,
          final_valuation_in_word: amountInWords,
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
          land_area,
          construction_area,
          age_of_property,
          type,
        });

        let ReportData = await reportData.save();
        // const currentDate = new Date();
        // const currentTimestamp = currentDate.getTime();
        // let file_name = req.body.user_id + "OF" + currentTimestamp;
        // replacePlaceholderInDocx(filePath, finalObj, file_name);

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          ...finalObj,
        });
      } else if (type_of_property == "Independent") {
        if (
          !age_of_property ||
          !construction_area ||
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
        // nearestProperties.sort(
        //   (a, b) =>
        //     parseInt(b.land_rate_per_sq_mtr_Sq_yard) -
        //     parseInt(a.land_rate_per_sq_mtr_Sq_yard)
        // );
        // top5 = nearestProperties.slice(0, 5);
        // sum = top5.reduce(
        //   (acc, obj) => acc + parseInt(obj.land_rate_per_sq_mtr_Sq_yard),
        //   0
        // );
        const plot_land_rate = top_area_rate_sum / top5.length;

        // let top_area_rate = nearestProperties
        //   .sort(
        //     (a, b) =>
        //       parseInt(b.area_rate_considered_per_sq_ft) -
        //       parseInt(a.area_rate_considered_per_sq_ft)
        //   )
        //   .slice(0, 5);
        // let top_area_rate_sum = top5.reduce(
        //   (acc, obj) => acc + parseInt(obj.area_rate_considered_per_sq_ft),
        //   0
        // );

        const construction_cost = construction_area * construction_rate;
        const typeValue = type == "House" ? 60 : 50;
        let depreciation;
        if (age_of_property > 5) {
          depreciation =
            (construction_cost * age_of_property * 0.9) / typeValue;
        } else {
          depreciation = construction_area * sum + plot_land_rate * land_area;
        }

        market_area = land_area * plot_land_rate + depreciation;

        const amountInWords = await numberToWords(market_area);
        const report = await ReportModel.findOne({
          type_of_property,
          carpet_area,
        });
        if (report == null) {
          if (noOfReport <= 0) {
            return res
              .status(400)
              .json({ error: "Please Pay for Ganarate Report" });
          }
          const updatedUser = await UserModel.findByIdAndUpdate(
            user_id,
            { no_of_report: noOfReport },
            { new: true }
          );
        }
        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: land_area,
          built_up_area_carpet_area_super_built_up_area: construction_area,
          // carpet_area || super_built_up_area,
          land_value: plot_land_rate * land_area,
          type_of_property: type_of_property,
          unit_rate_considered_for_land: plot_land_rate,
          unit_rate_considered_for_ca_bua_sba: top_area_rate_sum, // area_rate_considered_per_sq_ft, //area_per_sq_ft,
          building_value: depreciation, //construction_area*area_rate_considered_per_sq_ft+(land_rate_per_sq_mtr_Sq_yard*land_area)
          final_valuation: market_area,
          final_valuation_in_word: amountInWords,
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
          land_area,
          construction_area,
          age_of_property,
          type,
        });
        let ReportData = await reportData.save();

        // const currentDate = new Date();
        // const currentTimestamp = currentDate.getTime();
        // let file_name = req.body.user_id + "OF" + currentTimestamp;
        // replacePlaceholderInDocx(filePath, finalObj, file_name);

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
      } else if (type_of_property == "Land") {
        if (!land_area) {
          return res
            .status(404)
            .json({ status: false, message: "land_area Not Found" });
        }
        // nearestProperties.sort(
        //   (a, b) =>
        //     parseInt(b.land_rate_per_sq_mtr_Sq_yard) -
        //     parseInt(a.land_rate_per_sq_mtr_Sq_yard)
        // );
        // top5 = nearestProperties.slice(0, 5);
        // sum = top5.reduce(
        //   (acc, obj) => acc + parseInt(obj.land_rate_per_sq_mtr_Sq_yard),
        //   0
        // );

        const average = top_area_rate_sum / top5.length;

        market_area = land_area * average;

        const amountInWords = await numberToWords(market_area);
        const report = await ReportModel.findOne({
          type_of_property,
          carpet_area,
        });
        if (report == null) {
          if (noOfReport <= 0) {
            return res
              .status(400)
              .json({ error: "Please Pay for Ganarate Report" });
          }
          const updatedUser = await UserModel.findByIdAndUpdate(
            user_id,
            { no_of_report: noOfReport },
            { new: true }
          );
        }
        let finalObj = {
          ...reportObj,
          name_of_the_customers: name,
          property_land_area: land_area,
          built_up_area_carpet_area_super_built_up_area: 0,
          land_value: market_area,
          type_of_property: type_of_property,
          unit_rate_considered_for_land: average,
          unit_rate_considered_for_ca_bua_sba: 0,
          building_value: 0,
          final_valuation: market_area,
          final_valuation_in_word: amountInWords,
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
          land_area,
          construction_area,
          age_of_property,
          type,
        });
        let ReportData = await reportData.save();

        // const currentDate = new Date();
        // const currentTimestamp = currentDate.getTime();
        // let file_name = req.body.user_id + "OF" + currentTimestamp;
        // replacePlaceholderInDocx(filePath, finalObj, file_name);

        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          report_id: ReportData._id,
          usarData,
          land_area,
          // plot_land_rate,
          // construction_cost,
          // depreciation,
          average,
          ...finalObj,
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Please select a valid property type",
        });
      }

      let propertyType = {
        Apartment: "Apartment",
        Independent: "Independent",
        Land: "Land",
      };

      // res.status(200).json({
      //   status: true,
      //   message: "Nearest properties fetched successfully",
      //   market_area,
      //   usarData,
      // });
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
};
