require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { customError } = require("../utils/customError");
const { number, required } = require("joi");

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  guestId: {
    type: String,
    default: null,
  },
  items: [
    
  ],
  shippingInfo: {
    fullname: {
      type: String,
      required: false,
    },
    phone: { type: String },
    address: { type: String, required: false },
    email: { type: String },
    deliveryZone: {
      type: String,
    },
  },
  productWeight: {
    type: Number,
    default: 0,
  },
  deliveryCharge: { type: mongoose.Types.ObjectId },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  discountAmount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "sslcommerze"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed", "Cancelled"],
    default: "Pending",
  },
  transactionId: {
    type: String,
    default: null,
  },
  valid: {
    type: String,
    default: null,
  },
  currency: {
    type: String,
    default: "BDT",
  },
  paymentGatewayData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  orderStatus: {
    type: String,
    default: "Pending",
  },
  invoiceId: {
    type: String,
    default: null,
  },
  courier: {
    name: {
      type: String,
      default: null,
    },
    trackingId: { type: String, default: null },
    rawRespone: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: { type: String, default: "pending" },
  },
 
  followUp: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
 
  totalQuantity: { type: Number, default: 0 },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
