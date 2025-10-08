const express = require("express");
const variantController = require("../../controller/variant.controller")
const { upload } = require("../../midleware/multer.midleware");
const _ = express.Router();

_.route("/create-variant").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.createVariant
);
_.route("/getAllvariant").get(variantController.getAllvariant);
_.route("/getSingleVaraint/:slug").get(variantController.getSingleVaraint);

_.route("/upload_image-variant/:slug").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.uploadImageInVariant
);
_.route("/delete-variant-image/:slug").delete(variantController.deleteVariantImage)

_.route("/update-variant-info/:slug").put(variantController.updateVariantInfo)
module.exports = _;