const express = require("express");
const addUserController = require("../../controller/addUser.controller");
const { upload } = require("../../midleware/multer.midleware");

const _ = express.Router();

_.route("/addUser").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  addUserController.addUser
);
_.route("/getAllUserByAdmin").get(addUserController.getAllUserByAdmin);

module.exports = _;
