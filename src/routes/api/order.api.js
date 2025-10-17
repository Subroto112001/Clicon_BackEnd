const express = require("express");
const orderController = require("../../controller/order.controller");
const _ = express.Router();

_.route("/make-a-order").post(orderController.makeAorder);
_.route("/get-all-order").get(orderController.getAllOrders);
_.route("/update-order").put(orderController.updateOrderInfo);
_.route("/order-status").get(orderController.getAllOrderStatus);
_.route("/courier-pending-order").get(orderController.getallCourierPendingOrder);
_.route("/order-sent-to-courier").post(orderController.sentToCourier);
_.route("/webHook").post(orderController.webHook);
module.exports = _;
