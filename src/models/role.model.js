const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const roleSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    permission: [
      {
        type: Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

roleSchema.pre("save", async function (next) {
  const isexist = await this.constructor.findOne({ name: this.name });
  if (isexist && isexist._id.toString() !== this._id.toString()) {
    throw new customError(400, "Role name already exists");
  }
  next();
});
module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);
