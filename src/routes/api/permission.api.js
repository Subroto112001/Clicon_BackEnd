const express = require("express");
const permissionController = require("../../controller/permission.controller")
const _ = express.Router();



_.route("/create-permission").post(permissionController.createPermission);


module.exports = _;