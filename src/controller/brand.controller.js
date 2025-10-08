const { asyncHandeler } = require("../utils/asyncHandeler");
const brandmodel = require("../models/brand.model");
const { validateBrand } = require("../validation/brand.validation");
const {
  uploadImageColude,
  deleteColudinaryImage,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");



// @desc create a new brand 
exports.createBrand = asyncHandeler(async (req, res) => { 
  const value = await validateBrand(req);
  console.log(value)
  const cloudeImage = await uploadImageColude(value?.image?.path);
  

   const brand = await brandmodel.create({
      name: value.name,
      image: cloudeImage,
   });
  
  
  if (!brand) {
    throw new customError(400, "Brand creation failed");
  }

  apiResponse.senSuccess(res, 201, "Brand created successfully", brand);
});

// @desc get all brand
exports.getAllbrand = asyncHandeler(async (req, res) => {
  const allBrand = await brandmodel.find({});
  if (!allBrand) {
    throw new customError(404, "No brand found");
  }
  apiResponse.senSuccess(res, 200, "All brand list", allBrand);
});

// @desc get single brand
exports.getsingleBrand = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  
    const getsingleBrand = await brandmodel
    .findOne({ slug }).sort({ createdAt: -1 });
  if (!getsingleBrand) {
    throw new customError(404, "Brand not found");
  }
  apiResponse.senSuccess(res, 200, "Single brand details", getsingleBrand);
});
// @desc update single brand
exports.updateBrand = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
 
  
  const value = await validateBrand(req);

  
 
  const cloudeImage = await uploadImageColude(value?.image?.path);

  const updatedBrand = await brandmodel.findOneAndUpdate(
    { slug },
    { name: value.name, image: cloudeImage },
    { new: true }
  );
  if (!updatedBrand) {
    throw new customError(404, "Brand not found");
  }
  apiResponse.senSuccess(res, 200, "Brand updated successfully", updatedBrand);
});


// @desc delete single brand
exports.deleteSingleBrand = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  const deletedBrand = await brandmodel.findOneAndDelete({ slug });
  if (!deletedBrand) {
    throw new customError(404, "Brand not found");
  }

  // Delete image from Cloudinary if exists
  if (deletedBrand.image && deletedBrand.image.public_id) {
    await deleteColudinaryImage(deletedBrand.image.public_id);
  }

  apiResponse.senSuccess(res, 200, "Brand deleted successfully", deletedBrand);
});