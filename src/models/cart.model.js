require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { customError } = require("../utils/customError");



// Cart Schema
const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    items: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
        },
        variant: {
          type: Types.ObjectId,
          ref: "Variant",
          default: null,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          default: "N/A",
          required: true,
        },
        size: {
          type: String,
          default: "N/A",
          required: true,
        },
      },
    ],
    coupon: {
      type: Types.ObjectId,
      ref: "Coupon",
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "tk"],
     
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalSubtotal: {
      type: Number,
      required: true,
    },
   
    finalAmount: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to auto-calculate totalSubtotal
cartSchema.pre("save", function (next) {
  this.totalSubtotal = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
