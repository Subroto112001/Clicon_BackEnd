const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { customError } = require("../utils/customError");
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
      },
    ],
  },
  {
    timestamps: true,
  }
);

//existing permission check
permissionSchema.pre("save", async function (next) {
  const existingpermission = await this.constructor.findOne({
    name: this.name,
  });
  if (
    existingpermission &&
    existingpermission._id.toString() !== this._id.toString()
  ) {
    throw new customError(401, "Permission name is already exists!");
  }
  next();
});

module.exports =
  mongoose.models.Permisson || mongoose.model("Permisson", permissionSchema);
