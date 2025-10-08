require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");
const { customError } = require("../utils/customError");

const discountSchema = new Schema(
  {
    discountValidFrom: {
      type: Date,
      required: [true, "Discount start date is required"],
    },
    discountValidTo: {
      type: Date,
      required: [true, "Discount end date is required"],
    },
    discountName: {
      type: String,
      trim: true,
      required: [true, "Discount name is required"],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["tk", "percentage"],
      required: [true, "Discount type is required"],
    },
    discountValueByAmount: {
      type: Number,
      default: 0,
    },
    discountValueByPercentage: {
      type: Number,
      max: 100,
      default: 0,
    },
    discountPlan: {
      type: String,
      enum: ["category", "subCategory", "product"],
      required: [true, "Discount plan is required"],
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "SubCategory",
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

// ---------------------------
// 🔹 Utility: generate slug
// ---------------------------
const generateSlug = (name) =>
  slugify(name, {
    replacement: "-",
    lower: true,
    strict: true,
  });

// ---------------------------
// 🔹 Pre-save middleware
// ---------------------------
discountSchema.pre("save", async function (next) {
  if (this.isModified("discountName")) {
    this.slug = generateSlug(this.discountName);

    // Check duplicate slug
    const existing = await this.constructor.findOne({ slug: this.slug });
    if (existing && existing._id.toString() !== this._id.toString()) {
      throw new customError(400, "Discount name already exists");
    }
  }
  next();
});

// ---------------------------
// 🔹 Pre-update middleware
// ---------------------------
discountSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update?.discountName) {
    const newSlug = generateSlug(update.discountName);

    // Check duplicate slug
    const existing = await this.model.findOne({ slug: newSlug });
    if (
      existing &&
      existing._id.toString() !== this.getQuery()?._id?.toString()
    ) {
      throw new customError(400, "Discount name already exists");
    }

    update.slug = newSlug;
    this.setUpdate(update);
  }
  next();
});

// ---------------------------
// 🔹 Auto-sort (latest first)
// ---------------------------
discountSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 });
  next();
});

module.exports =
  mongoose.models.Discount || mongoose.model("Discount", discountSchema);
