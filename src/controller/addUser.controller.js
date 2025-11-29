const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const userModel = require("../models/user.model");
const { validateUser } = require("../validation/user.validation");
const { uploadImageColude } = require("../helpers/Coludinary");
const permissionModel = require("../models/permission.model");
// @desc add new user
exports.addUser = asyncHandeler(async (req, res, next) => {
  const value = await validateUser(req);

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ];

  /**
   *@desc: here check mimetype
   */

  if (!allowedMimeTypes.includes(req?.files?.image[0]?.mimetype)) {
    throw new customError(
      400,
      "Only JPG, JPEG, and PNG image files are allowed"
    );
  }
  /**
   *@desc: here check file length
   */
  if (req.files?.length == 0) {
    throw new customError(401, "Image not found");
  }

  /**
   *@desc: here check file size
   */

  if (req?.files?.image[0]?.size >= 10 * 1024 * 1024) {
    throw new customError(401, "image size below 5MB");
  }
  const cloudeImage = await uploadImageColude(req?.files?.image[0]?.path);

  const user = await userModel.create({
    ...value,
    createdBy: req?.user?.id || null,
    image: cloudeImage,
  });
  if (!user) {
    throw new customError(400, "User not created");
  }
  apiResponse.senSuccess(res, 201, "User created successfully", user);
});

// @desc get all user by admin
exports.getAllUserByAdmin = asyncHandeler(async (req, res) => {
  const users = await userModel
    .find({ role: { $exists: true, $ne: [] } })
    .populate("role");
  apiResponse.senSuccess(res, 200, "Users retrieved successfully", users);
});

// @desc add user permission
exports.addUserPermission = asyncHandeler(async (req, res, next) => {
  const { userId, permission } = req.body;
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    throw new customError(404, "User not found");
  }
  const permissionsToInsert = [];

  for (const p of permission) {
    const foundPermission = await permissionModel.findById(p.permissionId);

    if (!foundPermission) {
      throw new customError(404, `Permission '${p.permissionName}' not found`);
    }

    permissionsToInsert.push({
      permissionId: foundPermission._id,
      actions: p.actions,
    });
  }

  user.permission = permissionsToInsert;
  await user.save();
  apiResponse.senSuccess(res, 200, "Permission added successfully", user);
});
