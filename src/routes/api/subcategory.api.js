const express = require("express");
const categoryController = require("../../controller/category.controller");
const { upload } = require("../../midleware/multer.midleware");
const subcategorycontroller = require ('../../controller/subcategory.controller.js');
const _ = express.Router();



_.route("/create-subcategory").post(subcategorycontroller.createsubcategory);
_.route("/getall-subcategory").get(subcategorycontroller.getallsubcategory);
_.route("/getSingle-subcategory/:slug").get(subcategorycontroller.getSinglesubcategory);
_.route("/updateSingle-subcategory/:slug").put(
  subcategorycontroller.updatesubcategory
);
_.route("/deleteSingle-subcategory/:slug").delete(
  subcategorycontroller.deletesubcategory
);



module.exports = _;
