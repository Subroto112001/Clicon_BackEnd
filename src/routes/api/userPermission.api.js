const express = require("express");
const userPermissionController =require("../../controller/userPermission.controller")
const _ = express.Router();
_.route("/give-permission").post(userPermissionController.givePermission)
module.exports = _;
