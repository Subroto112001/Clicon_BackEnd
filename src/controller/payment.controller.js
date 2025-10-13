const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const orderModel = require("../models/order.model");

exports.paymentSuccess = asyncHandeler(async (req, res) => {
  console.log("From Payment Success", req.body);
  const { tran_id, val_id } = req.body;

  const updatedOrder = await orderModel.findOneAndUpdate(
    { transactionId: tran_id },
    {
      paymentStatus: "Success",
      orderStatus: "Confirmed",
      validationId: val_id,
      paymentGatewayData: req.body,
    },
    { new: true }
  );

  if (!updatedOrder) {
    throw new customError(404, "Order not found");
  }

  // Only redirect - don't send apiResponse after redirect
  return res.redirect(`https://www.google.com/`);
});

exports.paymentFailed = asyncHandeler(async (req, res) => {
  console.log("From Payment Failed", req.body);
  res.redirect("http://www.google.com");

  apiResponse.senSuccess(res, 200, "Payment Failed", req.body);
});

exports.paymentCancel = asyncHandeler(async (req, res) => {
  console.log("From Payment cancel", req.body);
  res.redirect("http://www.google.com");

  apiResponse.senSuccess(res, 200, "Payment cancel", req.body);
});

exports.paymentipn = asyncHandeler(async (req, res) => {
  console.log("IPN HIT ✅", req.body);

  const { tran_id, val_id, status } = req.body;

  // Update order based on IPN data
  if (status === "VALID" || status === "VALIDATED") {
    await orderModel.findOneAndUpdate(
      { transactionId: tran_id },
      {
        paymentStatus: "Success",
        orderStatus: "Confirmed",
        validationId: val_id,
        paymentGatewayData: req.body,
      }
    );
  }

  // MUST return 200 OK to SSLCommerz
  return res.status(200).json({ message: "IPN received successfully" });
});