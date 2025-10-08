require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { customError } = require("../utils/customError");
const slugify = require("slugify");

const brandSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Brand name is required"],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    image: {
      type: Object,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔹 Utility: generate slug
const generateSlug = (name) =>
  slugify(name, {
    replacement: "-",
    lower: true,
    strict: true,
  });

// 🔹 Pre-save middleware for slug
brandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = generateSlug(this.name);

    // Check duplicate slug
    const existing = await this.constructor.findOne({ slug: this.slug });
    if (existing && existing._id.toString() !== this._id.toString()) {
      throw new customError(400, "Brand name already exists");
    }
  }
  next();
});

// 🔹 Handle slug + duplicate in update
brandSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update?.name) {
    const newSlug = generateSlug(update.name);

    // Check duplicate slug
    const existing = await this.model.findOne({ slug: newSlug });
    if (
      existing &&
      existing._id.toString() !== this.getQuery()?._id?.toString()
    ) {
      throw new customError(400, "Brand name already exists");
    }

    update.slug = newSlug;
    this.setUpdate(update);
  }
  next();
});

// 🔹 Auto-sort by latest created brand
brandSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 });
  next();
});

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
