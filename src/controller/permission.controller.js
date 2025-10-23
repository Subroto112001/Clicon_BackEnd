const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const permissionModel = require("../models/permission.model");

exports.createPermission = asyncHandeler(async (req, res) => {
  const permission = await permissionModel.create(req.body);
  if (!permission) {
    throw new customError(400, "Permission creation failed");
  }
  apiResponse.senSuccess(
    res,
    201,
    "Permission created successfully",
    permission
  );
});
