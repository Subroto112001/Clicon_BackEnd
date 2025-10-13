const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const orderModel = require("../models/order.model");

exports.paymentSuccess = asyncHandeler(async (req, res) => {
  console.log("From Payment Success", req.body);
  const { tran_id, val_id } = req.body;

  const updateOrderModelSSlcOmerzInfo = await orderModel.findOneAndUpdate(
    {
      transactionId: tran_id,
    },
    {
      paymentStatus: "VALID" && "Success",
      transactionId: tran_id,
      valid: val_id,
      paymentGatewayData : req.body,
    }
  );

  res.redirect("http://www.google.com");

  apiResponse.senSuccess(res, 200, "Payment successfull", req.body);
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
  console.log("From Payment ipn", req.body);
  res.redirect("http://www.google.com");

  apiResponse.senSuccess(res, 200, "Payment ipn", req.body);
});
 