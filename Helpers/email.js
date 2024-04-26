const { user, password } = require("../Config/Config");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: user,
    pass: password,
  },
});

let sendMail = async (to, otp) => {
  try {
    const mailOptions = {
      from: user,
      to: to,
      subject: "Verification From Property ✔",
      text: "For Verify Email",
      html: `<p>This is OTP For Verify Email</p><b>${otp}</b>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    console.log("Email MessageId: " + info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Server Error");
  }
};

module.exports = { sendMail };
