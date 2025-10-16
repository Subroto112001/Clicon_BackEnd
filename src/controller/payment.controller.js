const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const orderModel = require("../models/order.model");
const SSLCommerzPayment = require("sslcommerz-lts");




// ssl Commerze

const store_id = process.env.SSL_STOREID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true;


exports.paymentSuccess = asyncHandeler(async (req, res) => {
  const {val_id } = req.body;


const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const validateOrder = await sslcz.validate([val_id]);
  const { status, tran_id } = validateOrder;
  
  const updateOrderModelSSlcOmerzInfo = await orderModel.findOneAndUpdate(
    {
      transactionId: tran_id,
    },
    {
      paymentStatus: status == "VALID" && "Success",
      transactionId: tran_id,
      valid: val_id,
      paymentGatewayData: validateOrder,
      orderStatus: "Confirmed",
    }
  );

  apiResponse.senSuccess(res, 200, "Order Placed Successfully", null);
});

exports.paymentFailed = asyncHandeler(async (req, res) => {
  console.log("From Payment Failed", req.body);
  const { tran_id, val_id, status } = req.body;

  const updateOrderModelSSlcOmerzInfo = await orderModel.findOneAndUpdate(
    {
      transactionId: tran_id,
    },
    {
      paymentStatus: status == "FAILED" && "Failed",
      transactionId: tran_id,
      valid: val_id,
      paymentGatewayData: req.body,
    }
  );
  return res.redirect("http://www.google.com");
});

exports.paymentCancel = asyncHandeler(async (req, res) => {
  console.log("From Payment cancel", req.body);
  const { tran_id, val_id, status } = req.body;

  const updateOrderModelSSlcOmerzInfo = await orderModel.findOneAndUpdate(
    {
      transactionId: tran_id,
    },
    {
      paymentStatus: status == "CANCEL" && "Cancelled",
      transactionId: tran_id,
      valid: val_id,
      paymentGatewayData: req.body,
    }
  );
  return res.redirect("http://www.google.com");
});

exports.paymentipn = asyncHandeler(async (req, res) => {
  console.log("From Payment ipn", req.body);
  return res.redirect("http://www.google.com");
});
