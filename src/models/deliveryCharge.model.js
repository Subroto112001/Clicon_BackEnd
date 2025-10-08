require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const { customError } = require("../utils/customError");

const deliveryChargeSchema = new Schema({
  name: { type: String, required: [true, "Delivery charge name is required"] },
  charge: { type: Number, required: [true, "Delivery charge is required"] },
  description: { type: String },
});

deliveryChargeSchema.pre("save", async function (next) {
  const isexist = await this.constructor.findOne({ name: this.name });
  if (isexist && isexist._id.toString() !== this._id.toString()) {
    throw new customError(400, "Delivery charge name already exists");
  }
  next();
});

module.exports =
  mongoose.models.DeliveryCharge ||
  mongoose.model("DeliveryCharge", deliveryChargeSchema);
