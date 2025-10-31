const express = require("express");
const categoryController = require("../../controller/category.controller");
const { upload } = require("../../midleware/multer.midleware");
const _ = express.Router();
const bandcontroller = require("../../controller/brand.controller");
const { authGurd } = require("../../midleware/authgurd.Middleware");
const { authorize } = require("../../midleware/authorize.middleware");

_.route("/createBrand").post(
  authGurd,
  authorize("brand", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  bandcontroller.createBrand
);

_.route("/allBrand").get(bandcontroller.getAllbrand);
_.route("/singleBrand/:slug").get(bandcontroller.getsingleBrand);
_.route("/updateBrand/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  bandcontroller.updateBrand
);
_.route("/deleteBrand/:slug").delete(bandcontroller.deleteSingleBrand);

module.exports = _;