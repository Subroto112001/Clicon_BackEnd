const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const deliveryChargeModel = require("../models/deliveryCharge.model");

// @desc create a delivery CHarge
exports.createDeliveryCharge = asyncHandeler(async (req, res) => {
  const { name, charge, description } = req.body;
  if (!name || !charge) {
    throw new customError(400, "Delivery charge name and charge is required");
  }

  const deliveryCharge = await new deliveryChargeModel({
    name,
    charge,
    description,
  });

  if (!deliveryCharge) {
    throw new customError(400, "Delivery charge creation failed");
  }

  await deliveryCharge.save();
  apiResponse.senSuccess(
    res,
    201,
    "Delivery charge created successfully",
    deliveryCharge
  );
});

// @desc get all delivery charge
exports.getAllDeliveryCharge = asyncHandeler(async (req, res) => {
  const allDeliveryCharge = await deliveryChargeModel.find();
  if (!allDeliveryCharge) {
    throw new customError(404, "No delivery charges found");
  }
  apiResponse.senSuccess(
    res,
    200,
    "All delivery charges retrieved successfully",
    allDeliveryCharge
  );
});

// @desc get single delivery charge
exports.getSingleDeliveryCharge = asyncHandeler(async (req, res) => {
  const { id } = req.params;
  const singleDeliveryCharge = await deliveryChargeModel.findById({ _id:id });
  if (!singleDeliveryCharge) {
    throw new customError(404, "Delivery charge not found");
  }
  apiResponse.senSuccess(
    res,
    200,
    "Single delivery charge retrieved successfully",
    singleDeliveryCharge
  );
});

// @desc update delivery Charge
exports.updateDeliveryCharge = asyncHandeler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      throw new customError(400, "Delivery charge id is required");
    }
  const { name, charge, description } = req.body;
  const updatedDeliveryCharge = await deliveryChargeModel.findByIdAndUpdate(
    { _id: id },
    { name, charge, description },
    { new: true }
  );
  if (!updatedDeliveryCharge) {
    throw new customError(404, "Delivery charge not found");
  }
  apiResponse.senSuccess(
    res,
    200,
    "Delivery charge updated successfully",
    updatedDeliveryCharge
  );
});

// @desc delete delivery cahrge
exports.deleteDeliveryCharge = asyncHandeler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new customError(400, "Delivery charge id is required");
  }
  const deletedDeliveryCharge = await deliveryChargeModel.findByIdAndDelete({
    _id: id,
  });
  if (!deletedDeliveryCharge) {
    throw new customError(404, "Delivery charge not found");
  }
  apiResponse.senSuccess(
    res,
    200,
    "Delivery charge deleted successfully",
    deletedDeliveryCharge
  );
});