const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Property', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema and model for MongoDB
const dataSchema = new mongoose.Schema({
  // Define your schema fields here
  // Example:
  time: String,
  type_of_property: String,
  postal_address_of_the_property: String,
  latitude_longitude: String,
  property_sub_classification: String,
  age_of_the_property: String,
  type_of_construction: String,
  land_area_sq_mtr_sq_yrd: String,
  land_rate_per_sq_mtr_Sq_yard: String,
  construction_area_sq_ft_built_up_area: String,
  area_rate_considered_per_sq_ft: String,
  built_up_area: String,
  super_built_up_area: String,
  carpet_area: String,
  area_rate_considered_on: String,
  construction_area_sq_ft_super_uilt_area: String,
  construction_area_sq_ft_row_1: String,
  construction_area_sq_ft_built_up_area: String,
  construction_area_sq_ft_super_built_up_area: String,
});

const DataModel = mongoose.model('Data', dataSchema);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Express endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet);
  console.log("aaaa", data);
  // Insert data into MongoDB
  DataModel.insertMany(data)
    .then(() => {
      res.status(200).json({ message: 'Data inserted successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while inserting data' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
