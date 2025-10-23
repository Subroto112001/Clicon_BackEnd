const express = require("express");
const roleController = require("../../controller/role.controller")
const _ = express.Router();

_.route("/create-role").post(roleController.createRole);

module.exports = _;
