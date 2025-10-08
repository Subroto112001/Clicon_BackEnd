require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");
const { customError } = require("../utils/customError");

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: [true, "Coupon code should not contain extra spaces"],
          unique: [true, "Coupon code already exists"],
      lowercase: [true, "Coupon code should be in lowercase"],
    },
    expire: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      max: 100,
      default: 1,
    },
    useCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "tk"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Check duplicate slug
couponSchema.pre("save", async function (next) {
  const existing = await this.constructor.findOne({ _id: this._id });
  if (existing && existing._id.toString() !== this._id.toString()) {
    throw new customError(400, "Coupon code already exists");
  }
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
