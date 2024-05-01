const ReportModel = require("../Models/ReportModel");
const PropertyModel = require("../Models/PropertyModel");
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

async function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${day}-${month}-${year}`;
}

module.exports = {
  getNearestProperty: async (req, res) => {
    const {
      user_id,
      latitude,
      longitude,
      distance,
      type_of_property,
      carpet_area,
      super_built_up_area,
      plot_area,
      construction_area,
      age_of_property,
      type,
    } = req.body;
    let MaxDistance = distance || maxDistance;
    const currentDate = new Date();
    const reportDate = await formatDate(currentDate);
    console.log(MaxDistance);
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    const usarData = await UserModel.findOne({
      _id: user_id,
      is_active: true,
    }).select(["-password","-module","-is_verified","-is_active","-login_attempts","-no_of_report","-is_paid","-no_of_pdf","-createdAt","-updatedAt"]);
    if (isNaN(lat) || isNaN(long)) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude provided" });
    }

    try {
      const nearestProperties = await PropertyModel.find({
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
        return res.status(404).json({
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
      let market_area;

      if (type_of_property == "Apartment") {
        if (!carpet_area) {
          return res
            .status(404)
            .json({ status: false, message: "carpet_area Not Found" });
        }
        const area_per_sq_ft = sum / top5.length;
        market_area = carpet_area || super_built_up_area * area_per_sq_ft;
        const amountInWords = await numberToWords(market_area);
        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          market_area,
          area_per_sq_ft,
          area: carpet_area || super_built_up_area,
          amountInWords,
          usarData,
          reportDate,
          type_of_property
        });
      } else if (type_of_property == "Independent") {
        if (!age_of_property || !construction_area || !type || !plot_area) {
          return res.status(404).json({
            status: false,
            message: "Required fields not found for Independent property",
          });
        }
        const construction_rate = await calculatePrice(age_of_property);
        nearestProperties.sort(
          (a, b) =>
            parseInt(b.land_rate_per_sq_mtr_Sq_yard) -
            parseInt(a.land_rate_per_sq_mtr_Sq_yard)
        );
        top5 = nearestProperties.slice(0, 5);
        console.log(top5);
        sum = top5.reduce(
          (acc, obj) => acc + parseInt(obj.land_rate_per_sq_mtr_Sq_yard),
          0
        );
        console.log(sum);
        const plot_land_rate = sum / top5.length;
        console.log(construction_area, construction_rate);
        const construction_cost = construction_area * construction_rate;
        const typeValue = type == "House" ? 60 : 50;
        const depreciation =
          (construction_cost * age_of_property * 0.9) / typeValue;
        console.log(
          construction_cost,
          age_of_property,
          typeValue,
          depreciation
        );
        console.log(plot_area, plot_land_rate, depreciation);

        market_area = plot_area * plot_land_rate + depreciation;

        const amountInWords = await numberToWords(market_area);
        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          market_area,
          plot_area,
          plot_land_rate,
          construction_cost,
          depreciation,
          amountInWords,
          usarData,
          reportDate,
          type_of_property
        });
      } else if (type_of_property == "Land") {
        if (!plot_area) {
          return res
            .status(404)
            .json({ status: false, message: "plot_area Not Found" });
        }
        nearestProperties.sort(
          (a, b) =>
            parseInt(b.land_rate_per_sq_mtr_Sq_yard) -
            parseInt(a.land_rate_per_sq_mtr_Sq_yard)
        );
        top5 = nearestProperties.slice(0, 5);
        console.log(top5);
        sum = top5.reduce(
          (acc, obj) => acc + parseInt(obj.land_rate_per_sq_mtr_Sq_yard),
          0
        );
        console.log(sum);

        const average = sum / top5.length;
        console.log(average);

        market_area = plot_area * average;
        console.log(plot_area, average, market_area);
        const amountInWords = await numberToWords(market_area);
        res.status(200).json({
          status: true,
          message: "Nearest properties fetched successfully",
          market_area,
          plot_area,
          amountInWords,
          average,
          usarData,
          reportDate,
          type_of_property
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

      console.log(propertyType[type_of_property]);

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
};
