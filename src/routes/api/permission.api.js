const express = require("express");
const permissionController = require("../../controller/permission.controller")
const _ = express.Router();



_.route("/create-permission").post(permissionController.createPermission);
_.route("/get-permission").get(permissionController.getAllPermission);


module.exports = _;