const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const roleModel = require("../models/role.model")

// @desc create role 
exports.createRole = asyncHandeler(async (req, res) => {
    const role = await roleModel.create(req.body);
    if (!role) {
        throw new customError(400, "Role creation failed");
    }
    apiResponse.senSuccess(res, 201, "Role created successfully", role);
    
})
