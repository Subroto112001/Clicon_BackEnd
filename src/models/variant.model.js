require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");
const { customError } = require("../utils/customError");

const variantSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    slug: {
      type: String,
    },
    variantName: {
      type: String,
      trim: true,
      required: true,
    },
    size: {
      type: String,
      default: "N/A",
    },
    color: [
      {
        type: String,
        trim: true,
      },
    ],
    stockVariant: {
      type: Number,
      default: 0,
    },
    alertVariantStock: {
      type: Number,
      default: 0,
    },
    retailPrice: {
      type: Number,
      required: true,
    },
    wholeSalePrice: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    image: [
      {
        publicIP: { type: String },
        url: { type: String },
      },
    ],
    totalSale: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//
// Middleware to auto-generate slug
//
variantSchema.pre("save", async function (next) {
  if (this.isModified("variantName")) {
    this.slug = slugify(this.variantName, {
      replacement: "-",
      lower: true,
      strict: true,
    });
  }
  next();
});

//
// Middleware to ensure unique slug
//
variantSchema.pre("save", async function (next) {
  const findVariant = await this.constructor.findOne({ slug: this.slug });

  if (findVariant && findVariant._id.toString() !== this._id.toString()) {
    throw new customError(400, "Variant name already exists");
  }
  next();
});

module.exports =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
