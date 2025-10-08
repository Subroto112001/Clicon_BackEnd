const { asyncHandeler } = require("../utils/asyncHandeler");
const {
  uploadImageColude,
  deleteColudinaryImage,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const cuponModel = require("../models/cupon.model");
const { validateCoupon } = require("../validation/cupon.validation");

exports.createCupon = asyncHandeler(async (req, res, next) => {
   const cupon = await cuponModel.create(req.body);

   if (!cupon) {
     throw new customError(400, "Cupon creation failed");
   }

   apiResponse.senSuccess(res, 201, "Cupon created successfully", cupon);
  })

//   @desc get all cupon
exports.getAllCupon = asyncHandeler(async (req, res) => {
  const allcupon = await cuponModel.find();
  if (!allcupon) {
    throw new customError(404, "No cupons found");
  }
  apiResponse.senSuccess(res, 200, "All cupons retrieved successfully", allcupon);
});

// @desc get single cupon
exports.getSingleCupon = asyncHandeler(async (req, res) => {
    const { code } = req.params;
    const singlecupon = await cuponModel.findOne({ code });
    if (!singlecupon) {
      throw new customError(404, "Cupon not found");
    }
    apiResponse.senSuccess(res, 200, "Single cupon retrieved successfully", singlecupon);
})