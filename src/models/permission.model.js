const mongoose = require("mongoose");
const { customError } = require("../utils/customError");
const { types } = require("joi");
const { Schema, Types } = mongoose;

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    description: String,
    actions: [
      {
        type: String,
        enum: ["create", "read", "update", "delete"],
        trim: true,
        default: ["create", "read", "update", "delete"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

permissionSchema.pre("save", async function (next) {
  const isexist = await this.constructor.findOne({ name: this.name });
  if (isexist && isexist._id.toString() !== this._id.toString()) {
    throw new customError(400, "Permission name already exists");
  }
  next();
});

module.exports =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);
