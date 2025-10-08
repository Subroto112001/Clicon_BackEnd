const express = require("express");
const cuponController = require("../../controller/cupon.controller");
const { upload } = require("../../midleware/multer.midleware");
const { validateCoupon } = require("../../validation/cupon.validation");
const _ = express.Router();
_.route("/create-cupon").post(validateCoupon,cuponController.createCupon);
_.route("/getAll-cupon").get(cuponController.getAllCupon);
_.route("/getSingle-cupon/:code").get(cuponController.getSingleCupon);


module.exports = _;