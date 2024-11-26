const { parentPort, workerData } = require("worker_threads");
const ExcelJS = require("exceljs");
let { mongo_uri, db_user, db_password, db_ip } = require("./Config/Config");
const fs = require("fs");
const mongoose = require("mongoose");
const PropertyModel = require("./Models/PropertyModel"); // Update with actual path

mongo_uri = `mongodb://${db_user}:${db_password}@${db_ip}:27017/Property?authSource=Property`;
console.log("Database Successfully Connected In Worker", mongo_uri);

// Connect to MongoDB
mongoose
  .connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const XLSX = require("xlsx");

const processFile = async (filePath) => {
  console.log("Processing file:", filePath);

  try {
    const stream = fs.createReadStream(filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(stream);

    const batchSize = 1000;
    let batchData = [];

    for (const worksheet of workbook.worksheets) {
      console.log(`Processing sheet: ${worksheet.name}`);

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        // Skip header row
        const row = worksheet.getRow(rowNumber);
        // Extract and parse coordinates
        const latitude = parseFloat(row.getCell(4).value);
        const longitude = parseFloat(row.getCell(3).value);

        if (
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          console.error(
            `Invalid coordinates at row ${rowNumber} in sheet ${worksheet.name}: ` +
              `lat=${latitude}, lng=${longitude}`
          );
          continue; // Skip invalid row
        }
        if (
          typeof latitude !== "number" ||
          typeof longitude !== "number" ||
          isNaN(latitude) ||
          isNaN(longitude) ||
          latitude === null ||
          longitude === null
        ) {
          console.error(
            `Invalid coordinates at row >>>>>>>> ${rowNumber} in sheet ${worksheet.name}: ` +
              `lat=${latitude}, lng=${longitude}`
          );
          continue; // Skip invalid row
        }

        const rowData = {
          address: row.getCell(1).value,
          type_of_property: row.getCell(2).value,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(row.getCell(3).value).toFixed(6),
              parseFloat(row.getCell(4).value).toFixed(6),
            ],
          },
          land_rate_per_sq_mtr_Sq_yard: row.getCell(5).value,
          construction_area_sq_ft_built_up_area: row.getCell(6).value,
          area_rate_considered_per_sq_ft: row.getCell(7).value,
        };

        batchData.push(rowData);

        if (batchData.length === batchSize) {
          await PropertyModel.insertMany(batchData); // Wait for database operation
          console.log(
            `Inserted batch of ${batchSize} from sheet ${worksheet.name}`
          );
          batchData = []; // Clear batch to free memory
        }
      }
    }

    // Insert remaining rows for all sheets
    if (batchData.length > 0) {
      await PropertyModel.insertMany(batchData);
      console.log("Inserted remaining rows>>>>>>>>>>>>>");
    }

    fs.unlinkSync(filePath); // Clean up by deleting the file
    console.log("File data uploaded successfully");
  } catch (error) {
    console.error("Error in worker:", error);
    // throw error;
  }
};

// Worker starts processing when it receives file data
processFile(workerData.filePath)
  .then(() => {
    parentPort.postMessage({
      status: "success",
      message: "File processed successfully",
    });
  })
  .catch((error) => {
    parentPort.postMessage({ status: "error", message: error.message });
  });
