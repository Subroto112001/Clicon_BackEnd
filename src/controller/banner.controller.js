
const bannerModel = require("../models/banner.model");
const { validateBanner } = require("../validation/banner.validation");



const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const { uploadImageColude, deleteCloudinaryFile } = require("../helpers/Coludinary");
const { asyncHandeler } = require("../utils/asyncHandeler");
// create banner
exports.createBanner = asyncHandeler(async (req, res) => {
  const value = await validateBanner(req);
  //   upload cloudinary
  const image = await uploadImageColude(value.image.path);
  const banner = await bannerModel.create({ ...value, image });
  if (!banner) throw new customError(500, "Banner Create failed!!");
  apiResponse.senSuccess(res, 200, "Banner created Sucessfully", banner);
});

// get all banner
exports.getAllBanner = asyncHandeler(async (req, res) => {
  //   upload image into cloudinary
  const banner = await bannerModel.find();
  if (!banner) throw new customError(500, "Banner crate failed!!");
  apiResponse.senSuccess(res, 200, "Banner get Sucessfully", banner);
});

// update banner when image upload then delete old image and upload new image
exports.updateBanner = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  // ✅ Step 1: Validate request data
  const value = await validateBanner(req);

  // ✅ Step 2: Find existing banner
  const existingBanner = await bannerModel.findOne({ slug });
  if (!existingBanner) {
    throw new customError(404, "Banner not found");
  }

  let imageAsset = existingBanner.image; // keep old image if new one not provided

  // ✅ Step 3: If new image uploaded → delete old one & upload new
  if (value.image) {
    try {
      // delete old image from cloudinary if exists
      if (existingBanner?.image?.public_id) {
        await deleteCloudinaryFile(existingBanner.image.public_id);
      }

      // upload new image
      imageAsset = await uploadImageColude(value.image.path);
    } catch (err) {
      throw new customError(500, "Image upload failed: " + err.message);
    }
  }

  // ✅ Step 4: Update banner data
  const updatedBanner = await bannerModel.findOneAndUpdate(
    { slug },
    {
      ...value,
      image: imageAsset,
    },
    { new: true }
  );

  if (!updatedBanner) {
    throw new customError(500, "Banner update failed!!");
  }

  // ✅ Step 5: Send success response
  apiResponse.senSuccess(
    res,
    200,
    "Banner updated successfully",
    updatedBanner
  );
});

// delete banner when delete then remove old image into cloudinary
exports.deleteBanner = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  const banner = await bannerModel.findOneAndDelete({ slug });
  if (!banner) throw new customError(500, "Banner delete failed!!");
  await deleteCloudinaryFile(banner.image.public_id);
  apiResponse.senSuccess(res, 200, "Banner deleted Sucessfully", banner);
});
// getsingle banner
exports.getSingleBanner = asyncHandeler(async (req, res) => {
 const {slug} = req.params;
  const banner = await bannerModel.findOne({slug});
  if (!banner) throw new customError(404, "Banner not found");
  apiResponse.senSuccess(res, 200, "Banner retrieved successfully", banner);
});