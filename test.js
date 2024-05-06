export async function replacePlaceholderInDocx(docxPath, placeholder, dynamicValue) {
  try {
    const fs = require("fs");
    const PizZip = require("pizzip");
    const Docxtemplater = require("docxtemplater");

    if (!fs.existsSync(docxPath)) {
      console.error("Error: File not found.");
      return;
    }

    const content = fs.readFileSync(docxPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater().loadZip(zip);

    doc.render({ [placeholder]: dynamicValue });

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync("modified.docx", buffer);

    console.log("Placeholder replaced successfully.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export function convertDocxToPdf(docxPath, pdfPath) {
  const fs = require("fs");
  const path = require("path");
  const { exec } = require("child_process");

  const filePath = path.join(__dirname, pdfPath);
  console.log(filePath);

  exec(`python convert.py ${docxPath} ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`Python function output: ${stdout}`);
  });
}
