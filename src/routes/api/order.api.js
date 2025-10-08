const express = require("express");
const orderController = require("../../controller/order.controller");
const _ = express.Router();

_.route("/make-a-order").post(orderController.makeAorder);
module.exports = _;
