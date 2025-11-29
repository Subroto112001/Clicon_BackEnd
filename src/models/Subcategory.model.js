require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { customError } = require("../utils/customError");
const slugify = require("slugify");

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    discount: {
      type: Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    product: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ]
  },
  { timestamps: true }
);

// Middleware to create slug from name
subCategorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = await slugify(this.name, {
      replacement: "-",
      lower: false,
      strict: false,
    });
  }
  next();
});

// Check if subCategory slug already exists
subCategorySchema.pre("save", async function (next) {
  const findSubCategory = await this.constructor.findOne({ slug: this.slug });

  if (
    findSubCategory &&
    findSubCategory._id.toString() !== this._id.toString()
  ) {
    throw new customError(400, "SubCategory name already exists");
  }
  next();
});

const categoryPopulate = async function (next) { 
  this.sort({ createdAt: -1 });
  next();
}

const subcategorySorting = async function (next) {
  this.sort({ createdAt: -1 });
  next();
};
subCategorySchema.pre("find", categoryPopulate, subcategorySorting);
module.exports = mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);
