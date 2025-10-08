const express = require("express");
const productController = require("../../controller/product.controller");
const { upload } = require("../../midleware/multer.midleware");
const _ = express.Router();

_.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.createProduct
);
_.route("/getall-Product").get(productController.getAllProducts);
_.route("/getSingle-Product/:slug").get(productController.getSingleProduct);
_.route("/UpdateSingle-Product/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.updateProduct
);

_.route("/delete-Update-product-image/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.updateandDeleteImage
);
_.route("/delete-Product/:slug").delete(productController.deleteProduct);
_.route("/filter-product-bycategory").get(productController.getProductByCategory);
_.route("/filter-product-byPriceRange").get(productController.filterPriceRange);
_.route("/filter-product-byBrand").get(productController.filterbyBrand);
_.route("/product-pagination").get(productController.productPagination);
module.exports = _;
