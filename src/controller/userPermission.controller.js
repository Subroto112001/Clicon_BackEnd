const { asyncHandeler } = require("../utils/asyncHandeler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");

const permisisonModel = require("../models/permission.model")
const roleModel = require("../models/role.model")

// @desc give a user permission
exports.givePermission = asyncHandeler(async (req, res) => {
   console.log("Giving here user Permission");
   
})