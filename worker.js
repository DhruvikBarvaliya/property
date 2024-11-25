const { parentPort, workerData } = require('worker_threads');
const ExcelJS = require('exceljs');
const fs = require('fs');
const mongoose = require('mongoose');
const PropertyModel = require('./Models/PropertyModel');  // Update with actual path

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Property', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
const XLSX = require("xlsx");
// const fs = require("fs");
// This is where the file processing will happen in the worker thread
const processFile = async (filePath) => {
  console.log('Processing file:', filePath);
  
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const batchSize = 100;
    let batchData = [];

    workbook.eachSheet((worksheet) => {
      worksheet.eachRow(async(row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {
          address: row.getCell(1).value,
          type_of_property: row.getCell(2).value,
          location: {
            type: "Point",
            coordinates: [row.getCell(3).value, row.getCell(4).value],
          },
          land_area_sq_mtr_sq_yrd: row.getCell(5).value,
          land_rate_per_sq_mtr_Sq_yard: row.getCell(6).value,
          construction_area_sq_ft_built_up_area: row.getCell(7).value,
          area_rate_considered_per_sq_ft: row.getCell(8).value,
        };
        
        
        batchData.push(rowData);

        // Insert in batches
        if (batchData.length === batchSize) {
          PropertyModel.insertMany(batchData);
          console.log(batchData.length );
          batchData = [];
        }
      });
    });

    // Insert remaining rows
    if (batchData.length > 0) {
      console.log(">>>>>>",batchData[0]);
      
      await PropertyModel.insertMany(batchData);
    }

    // Clean up by deleting the file
    fs.unlinkSync(filePath);
    console.log('File data uploaded successfully');
  } catch (error) {
    console.error('Error in worker:', error);
    throw error;
  }
};

// Worker starts processing when it receives file data
processFile(workerData.filePath).then(() => {
  parentPort.postMessage({ status: 'success', message: 'File processed successfully' });
}).catch((error) => {
  parentPort.postMessage({ status: 'error', message: error.message });
});
