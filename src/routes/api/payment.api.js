const express = require("express");
const _ = express.Router();
const paymentCotroller = require("../../controller/payment.controller");

_.route("/success").post(paymentCotroller.paymentSuccess);
_.route("/fail").post(paymentCotroller.paymentFailed);
_.route("/cancel").post(paymentCotroller.paymentCancel);
_.route("/ipn").post(paymentCotroller.paymentipn);

module.exports = _;
