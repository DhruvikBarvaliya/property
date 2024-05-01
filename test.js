const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

async function replacePlaceholderInDocx(docxPath, placeholder, dynamicValue) {
  try {
    // Check if the file exists
    if (!fs.existsSync(docxPath)) {
      console.error("Error: File not found.");
      return;
    }

    // Read the .docx file
    const content = fs.readFileSync(docxPath, "binary");

    // Load the .docx file content as a zip file
    const zip = new PizZip(content);

    // Initialize Docxtemplater with the zip file
    const doc = new Docxtemplater().loadZip(zip);

    doc.render({ data: "hello dhruvki", land: "ok" });

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Write the modified content back to the .docx file
    fs.writeFileSync("modified.docx", buffer);

    console.log("Placeholder replaced successfully.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Replace the placeholder with a dynamic value
replacePlaceholderInDocx("demo.docx", "{myname}", "Dynamic Value");
