const express = require("express");
const orderController = require("../../controller/order.controller");
const _ = express.Router();

_.route("/make-a-order").post(orderController.makeAorder);
_.route("/get-all-order").get(orderController.getAllOrders);
module.exports = _;
