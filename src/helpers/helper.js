const nodemailer = require("nodemailer");
const { customError } = require("../utils/customError");
const { default: axios } = require("axios");

require("dotenv").config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",

  secure: process.env.NODE_ENV === "development" ? false : true, // true for 465, false for other ports
  auth: {
    user: "subrotokumarbarman@gmail.com",
    pass: process.env.APP_PASSWORD || "oetj lpnr obox kuup",
  },
});

exports.mailSender = async (
  email,
  template,
  subject = "Confirm Registration"
) => {
  const info = await transporter.sendMail({
    from: "Clicon",
    to: email,
    subject,

    html: template, // HTML body
  });

  console.log("Message sent:", info.messageId);
};

// sms sender

exports.smsSender = async (phoneNumber, message) => {
  try {
    const smsResponsefromsender = await axios.post(process.env.SMS_API_URL, {
      api_key: process.env.SMS_API_KEY,
      senderid: process.env.SMS_SENDER_ID,
      number: Array.isArray(phoneNumber) ? phoneNumber.join(",") : phoneNumber,
      message: message,
    });
    return smsResponsefromsender.data;
  } catch (error) {
    console.log("error from send sms", error);
    throw new customError(500, "Error from bulk sms", error);
  }
};
