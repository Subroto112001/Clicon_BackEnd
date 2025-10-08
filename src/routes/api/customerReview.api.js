const express = require("express");
const { upload } = require("../../midleware/multer.midleware");
const customerReviewController = require("../../controller/customerReview.controller");
const _ = express.Router();

_.route("/create-customer-review").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  customerReviewController.createCustomerReview
);

_.route("/delete-customer-review/:slug").delete(
  customerReviewController.deleteCustomerReview
);
_.route("/edit-customer-review").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  customerReviewController.editCustomerReview
);
module.exports = _;
