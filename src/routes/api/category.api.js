const express = require("express");
const categoryController = require("../../controller/category.controller");
const { upload } = require("../../midleware/multer.midleware");
const _ = express.Router();

_.route("/create-category").post(
  upload.fields([{ name: "image", maxCount: 1 }]),

  categoryController.createCategory
);
_.route("/get-allCategory").get(categoryController.getAllCategory);
_.route("/get-single-Category/:slug").get(categoryController.getSingleCategory);
_.route("/update-single-Category/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.updateSingleCategory
);
_.route("/delete_single-category/:slug").delete(
  categoryController.deleteSingleCategory
);
module.exports = _;
