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
      const user = await UserModel.findById(user_id).select(
        "email name no_of_report"
      );

      let user_name = user.name || user.email;
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
        user: user_name,
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
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You for Your Purchase!</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding: 20px;
                        background-color: #4CAF50;
                        color: #ffffff;
                        border-top-left-radius: 10px;
                        border-top-right-radius: 10px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .content h2 {
                        font-size: 20px;
                        color: #333333;
                    }
                    .content p {
                        font-size: 16px;
                        color: #555555;
                    }
                    .order-details {
                        margin: 20px 0;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    .order-details th, .order-details td {
                        padding: 10px;
                        border: 1px solid #dddddd;
                        text-align: left;
                    }
                    .order-details th {
                        background-color: #f2f2f2;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f9f9f9;
                        color: #777777;
                        font-size: 14px;
                        border-bottom-left-radius: 10px;
                        border-bottom-right-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Desktop Valuation</h1>
                    </div>
                        <h2>Thank You for Your Purchase!</h2>
                    <div class="content">
                        <h2>Order Confirmation</h2>
                        <p>Hi ${data.user},</p>
                        <p>Thank you for shopping with us! We're excited to let you know that your order has been received and is being processed. Below are the details of your purchase:</p>

                        <table class="order-details">
                            <tr>
                                <th>Plan Name</th>
                                <td>${data.plan_name}</td>
                            </tr>
                            <tr>
                                <th>No Of Report</th>
                                <td>${data.no_of_report}</td>
                            </tr>
                            <tr>
                                <th>Per Report Price</th>
                                <td>${data.per_report_price}</td>
                            </tr>
                            <tr>
                                <th>Order Date</th>
                                <td>${data.invoiceDate}</td>
                            </tr>
                             <tr>
                                <th>Payment Ref.No</th>
                                <td>${data.razor_pay_response}</td>
                            </tr>
                            <tr>
                                <th>Subscription Ref.No</th>
                                <td>${data.subscriptions_id}</td>
                            </tr>
                            <tr>
                                <th>Total</th>
                                <td>₹${data.totalAmount}</td>
                            </tr>
                        </table>

                        <p>If you have any questions, feel free to contact our customer service at contactus@desktopvaluation.in / +91-9687557070.</p>

                        <p>Thank you for choosing Desktop Valuation.</p>

                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Desktop Valuation. All rights reserved.</p>
                         <p><a href="https://desktopvaluation.in/" target="_blank">Visit Our Platform</a></p>
                    </div>
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
      await mailSend(user.email, invoiceHtml);

      // generatePdf(invoiceHtml, pdfPath)
      //   .then(async () => {
      //     console.log("PDF generated successfully.");

      //     // Set up the email options with PDF attachment
      //     const options = {
      //       attachments: [
      //         {
      //           filename: "invoice.pdf",
      //           path: pdfPath,
      //         },
      //       ],
      //     };

      //     // await mailSend(user.email, invoiceHtml);
      //     // Delete the PDF file from the system
      //     // fs.unlink(pdfPath, (err) => {
      //     //   if (err) {
      //     //     console.log("Failed to delete PDF:", err);
      //     //   } else {
      //     //     console.log("PDF deleted successfully.");
      //     //   }
      //     // });
      //   })
      //   .catch((err) => {
      //     console.log("Failed to generate PDF:", err);
      //   });

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
