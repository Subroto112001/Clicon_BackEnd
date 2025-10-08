require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customError } = require("../utils/customError");
const slugify = require("slugify");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: {},
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subCategory: [
      {
        type: Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    discount: {
      type: Types.ObjectId,
      ref: "Discount",
    },
  },
  { timestamps: true }
);

// Middleware to make slug
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = await slugify(this.name, {
      replacement: "-",
      lower: false,
      strict: false,
    });
  }
  next();
});

// Check if category name already exists
categorySchema.pre("save", async function (next) {
  const findCategory = await this.constructor.findOne({ slug: this.slug });

  if (findCategory && findCategory._id.toString() !== this._id.toString()) {
    throw new customError(400, "Category name already exists");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
