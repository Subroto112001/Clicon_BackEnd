const mongoose = require("mongoose");
const { customError } = require("../utils/customError");
const { Schema } = mongoose;
const slugify = require("slugify");

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Before save, validate unique name & generate slug
permissionSchema.pre("save", async function (next) {
  // Name must be unique
  const isexist = await this.constructor.findOne({ name: this.name });
  if (isexist && isexist._id.toString() !== this._id.toString()) {
    throw new customError(400, "Permission name already exists");
  }

  // Generate slug from name
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }

  next();
});

module.exports =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);
