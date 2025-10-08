const express = require("express");
const discountController = require("../../controller/discount.controller")
const { upload } = require("../../midleware/multer.midleware");
const _ = express.Router();

_.route("/create-discount").post(discountController.createDiscount);
_.route("/get-all-discount").get(discountController.getAlldiscount);
_.route("/get-single-discount/:slug").get(discountController.getSingleDiscount);
_.route("/update-discount/:slug").put(discountController.updatediscount);
_.route("/delete-discount/:slug").delete(discountController.deletesinglediscount);
module.exports = _;