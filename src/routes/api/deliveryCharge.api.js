const express = require("express");
const deliveryChargeController = require("../../controller/deliveryCharge.controller");
const _ = express.Router();

_.route("/create-delivery-charge").post(
  deliveryChargeController.createDeliveryCharge
);

_.route("/get-All-DeliveryCharge").get(
  deliveryChargeController.getAllDeliveryCharge
);
_.route("/get-Single-DeliveryCharge").get(
  deliveryChargeController.getSingleDeliveryCharge
);
_.route("/update-DeliveryCharge/:id").put(
  deliveryChargeController.updateDeliveryCharge
);
_.route("/delete-DeliveryCharge/:id").delete(
  deliveryChargeController.deleteDeliveryCharge
);

module.exports = _;
