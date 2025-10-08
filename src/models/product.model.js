require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const slugify = require("slugify");
const { customError } = require("../utils/customError");
const { required } = require("joi");

const reviewSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User", // assuming you have a User model
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reviewer: {
      type: Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      trim: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    }
    ,
    image: [{}]
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: [
      {
        publicIP: String,
        url: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    wholeSalePrice: {
      type: Number,
    },
    retailPrice: {
      type: Number,
    },
    wholeSaleProfitAmount: {
      type: Number,
      max: 100,
    },
    retailProfitAmount: {
      type: Number,
      max: 100,
    },
    stockAlert: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
    },
    sku: {
      type: String,
      trim: true,
    },
    barCode: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    returnPolicy: String,
    minimumOrderQuantity: {
      type: Number,
      min: 5,
      default: 5,
    },
    variant: {
      type: Types.ObjectId,
      ref: "Variant",
    },
    manufactureCountry: {
      type: String,
      trim: true,
    },
    size: [
      {
        type: String,
        default: "N/A",
      },
    ],
    color: [
      {
        type: String,
        trim: true,
      },
    ],
    groupUnit: {
      type: String,
      enum: ["Box", "Packet", "Dozen", "Custom"],
    },
    groupQuantity: {
      type: Number,
    },
    unit: {
      type: String,
      enum: ["Piece", "Kg", "Gram", "Packet", "Custom"],
    },
    variantType: {
      type: String,
      enum: ["SingleVariant", "MultipleVariant"],
      default: "SingleVariant",
    },
    warehouseLocation: [
      {
        type: Types.ObjectId,
        ref: "Warehouse",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSale: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware to make slug
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
    });
  }
  next();
});



// Middleware to generate slug on update
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.$set.name) {
    const newSlug = slugify(update.$set.name, {
      lower: true,
      strict: true,
    });
    
    const docToUpdate = await this.model.findOne(this.getQuery());
    const existing = await this.model.findOne({ slug: newSlug });

    if (existing && existing._id.toString() !== docToUpdate._id.toString()) {
      return next(
        new customError(400, "A product with this name already exists.")
      );
    }
    update.$set.slug = newSlug;
  }
  next();
});




// Check duplicate slug
productSchema.pre("save", async function (next) {
  const existing = await this.constructor.findOne({ slug: this.slug });
  if (existing && existing._id.toString() !== this._id.toString()) {
    throw new customError(400, "Product name already exists");
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
