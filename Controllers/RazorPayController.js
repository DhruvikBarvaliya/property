const RazorPayModel = require("../Models/RazorPayModel");
const UserModel = require("../Models/UserModel");
const SubscriptionModel = require("../Models/SubscriptionModel");
const SubscriptionHistoryModel = require("../Models/SubscriptionHistoryModel");
const { mailSend } = require("../Helpers/email");
const path = require("path");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
let fs = require("fs");
module.exports = {
  addRazorPay: async (req, res) => {
    try {
      const { user_id, razor_pay_response, subscriptions_id } = req.body;
      if (!user_id || !razor_pay_response || !subscriptions_id) {
        return res.status(400).json({
          status: false,
          message: `razorpay_${
            !user_id ? "id" : "razor_pay_response and subscriptions_id"
          } is Required`,
        });
      }
      const user = await UserModel.findById(user_id).select("no_of_report");
      if (!user) {
        return res.status(404).json({
          status: false,
          message: `User not found with ID: ${user_id}`,
        });
      }
      const subscription = await SubscriptionModel.findById(subscriptions_id);
      if (!subscription) {
        return res.status(404).json({
          status: false,
          message: `Subscription not found with ID: ${subscriptions_id}`,
        });
      }

      const razorpayData = new RazorPayModel({
        user_id,
        razor_pay_response,
        subscriptions_id,
      });
      await razorpayData.save();

      await UserModel.findByIdAndUpdate(
        user_id,
        {
          subscriptions_id,
          no_of_pdf: subscription.no_of_report,
          no_of_report: subscription.no_of_report,
          is_paid: true,
        },
        { new: true }
      );
      const SubscriptionHistory = new SubscriptionHistoryModel({
        user_id,
        subscriptions_id,
      });
      await SubscriptionHistory.save();

      const now = new Date();

      const day = String(now.getDate()).padStart(2, "0");
      const month = now.toLocaleString("en-US", { month: "short" }); // 'Aug'
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      let img = path.join(__dirname, "../Media/images.png");
      const formattedDate = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
      let id = uuidv4();
      // Dynamic data
      const invoiceData = {
        invoiceNumber: id,
        invoiceDate: formattedDate,
        user_id: razorpayData.user_id,
        subscriptions_id: razorpayData.subscriptions_id,
        razor_pay_response: razorpayData.razor_pay_response,
        plan_name: subscription.plan_name,
        no_of_report: subscription.no_of_report,
        per_report_price: subscription.per_report_price,
        discount: subscription.discount,
        price: subscription.price,
        company: {
          name: "Earth Engineering",
          address: "45 Nana Varachha, Surat(Gujarat), India",
        },
        client: {
          name: "Parth Kumar",
          address: "78 Mota Varachha, Surat(Gujarat), India",
        },
        paymentMethod: "Check",
        totalAmount: subscription.final_price,
      };

      // Generate the HTML with dynamic content
      const generateInvoiceHtml = (data) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="title">
                                    <img src="https://earthengineers.in/wp-content/uploads/2021/09/Logo.png" style="width: 100%; max-width: 100px;" />
                                </td>
                                <td>
                                    Invoice #: ${data.invoiceNumber}<br />
                                    Created: ${data.invoiceDate}<br />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                    ${data.company.name},<br />
                                    ${data.company.address}
                                </td>
                                <td>
                                    ${data.client.name},<br />
                                    ${data.client.address}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="heading">
                    <td>Field</td>
                    <td>Value</td>
                </tr>
                <tr class="details">
                    <td>User Id</td>
                    <td>${data.user_id}</td>
                </tr>
                 <tr class="details">
                    <td>Subscriptions Id</td>
                    <td>${data.subscriptions_id}</td>
                </tr>
                 <tr class="details">
                    <td>Razor Pay Response</td>
                    <td>${data.razor_pay_response}</td>
                </tr>
                 <tr class="details">
                    <td>Plan Name</td>
                    <td>${data.plan_name}</td>
                </tr>
                 <tr class="details">
                    <td>No Of Report</td>
                    <td>${data.no_of_report}</td>
                </tr>
                 <tr class="details">
                    <td>Per Report Price</td>
                    <td>${data.per_report_price}</td>
                </tr>
                 <tr class="details">
                    <td>Discount</td>
                    <td>${data.discount}%</td>
                </tr>
                 <tr class="details">
                    <td>Price</td>
                    <td>${data.price}</td>
                </tr>
                <tr class="total">
                    <td></td>
                    <td>Total: ${data.totalAmount}</td>
                </tr>
            </table>
        </div>
      </body>
      </html>
        `;
      };

      // Function to generate PDF from HTML using Puppeteer
      const generatePdf = async (htmlContent, outputPath) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        await page.pdf({ path: outputPath, format: "A4" });
        await browser.close();
      };

      // Path where the PDF will be saved
      const pdfPath = path.join(__dirname, `../Media/pdf/${id}_invoice.pdf`);

      // Generate the HTML content
      const invoiceHtml = generateInvoiceHtml(invoiceData);

      generatePdf(invoiceHtml, pdfPath)
        .then(async () => {
          console.log("PDF generated successfully.");

          // Set up the email options with PDF attachment
          const options = {
            attachments: [
              {
                filename: "invoice.pdf",
                path: pdfPath,
              },
            ],
          };

          await mailSend(user.email, options);
          // Delete the PDF file from the system
          fs.unlink(pdfPath, (err) => {
            if (err) {
              console.log("Failed to delete PDF:", err);
            } else {
              console.log("PDF deleted successfully.");
            }
          });
        })
        .catch((err) => {
          console.log("Failed to generate PDF:", err);
        });

      return res
        .status(201)
        .json({ message: "RazorPay response added Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getAllRazorPay: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || 10);
      const skip = parseInt(req.query.skip || 0);
      const [allRazorPay, total] = await Promise.all([
        RazorPayModel.find({ is_active: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip),
        RazorPayModel.countDocuments(),
      ]);

      if (!allRazorPay.length) {
        return res
          .status(404)
          .json({ status: false, message: "RazorPay Not Found In Database" });
      }

      return res.status(200).json({
        status: true,
        total,
        length: allRazorPay.length,
        message: "RazorPay Get Successfully",
        allRazorPay,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  getRazorPayById: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findOne({
        _id: razorpay_id,
        is_active: true,
      });
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Get Successfully", razorpay });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateRazorPay: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        req.body,
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Updated Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  updateRazorPayStatus: async (req, res) => {
    try {
      const { razorpay_id, status } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        { is_active: status },
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res.status(200).json({
        status: true,
        message: "RazorPay Status Updated Successfully",
        razorpay,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
  deleteRazorPay: async (req, res) => {
    try {
      const { razorpay_id } = req.params;
      const razorpay = await RazorPayModel.findByIdAndUpdate(
        razorpay_id,
        { is_active: false },
        { new: true }
      );
      if (!razorpay) {
        return res.status(404).json({
          status: false,
          message: `RazorPay Not Found With ID :- ${razorpay_id} `,
        });
      }
      return res
        .status(200)
        .json({ status: true, message: "RazorPay Deleted Successfully" });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
    }
  },
};
