const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const permissionModel = require("../models/permission.model");

exports.createPermission = asyncHandeler(async (req, res) => {
  for (let p in req.body) {
    if (req.body[p] == "") {
      throw new customError(400, "Please fill the fields");
    }
    }
    const newpermission = await permissionModel.create({
        name: req.body.name,
        actions: req.body.actions
    });

    if (!newpermission) {
        throw new customError(400, "Permission creation failed");
    }
    apiResponse.senSuccess(res, 201, "Permission created successfully", newpermission); 
});

// @desc get all permission
exports.getAllPermission = asyncHandeler(async (req, res) => {
  const allpermission = await permissionModel.find();
  if (!allpermission) {
    throw new customError(404, "No permission found");
  }
  apiResponse.senSuccess(res, 200, "All permission retrieved successfully", allpermission);
});


// @desc delete permission 
exports.deletePermission = asyncHandeler(async (req, res) => {
  const { id } = req.params;
  const deletedpermission = await permissionModel.findByIdAndDelete({ _id: id });
  if (!deletedpermission) {
    throw new customError(404, "Permission not found");
  }
  apiResponse.senSuccess(res, 200, "Permission deleted successfully", deletedpermission);
});