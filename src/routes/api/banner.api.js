const express = require("express");
const _ = express.Router();

const bannerController = require("../../controller/banner.controller");

const { upload } = require("../../midleware/multer.midleware");
const { authGurd } = require("../../midleware/authgurd.Middleware");
const { authorize } = require("../../midleware/authorize.middleware");
_.route("/create-banner").post(
  authGurd,
  // authorize("banner", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  bannerController.createBanner
);

_.route("/get-all-banner").get(bannerController.getAllBanner);
_.route("/update-banner/:slug").put(
  //   authGuard,
  //   authorize("banner", "edit"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  bannerController.updateBanner
);

_.route("/delete-banner/:slug").delete(
  //   authGuard,
  //   authorize("banner", "delete"),
  bannerController.deleteBanner
);
_.route("/get-single-banner/:slug").get(bannerController.getSingleBanner);
module.exports = _;
