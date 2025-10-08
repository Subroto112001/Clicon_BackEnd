const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateVariant } = require("../validation/variant.validation");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const {
  uploadImageColude,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const variantModel = require("../models/variant.model");
const productModel = require("../models/product.model");

// @desc create a product variant
exports.createVariant = asyncHandeler(async (req, res) => {
  const value = await validateVariant(req);
  console.log(value);

  // upload image
  const pictureurl = await Promise.all(
    value.image.map((img) => uploadImageColude(img.path))
  );

  const variant = await variantModel.create({ ...value, image: pictureurl });
  if (!variant) {
    throw new customError(500, "variant not created");
  }

  const productVaraintId = await productModel.findOneAndUpdate(
    { _id: value.product },
    { $push: { variant: variant._id } },
    { new: true }
  );
  if (!productVaraintId) {
    throw new customError(500, "Product variant push failed");
  }
  apiResponse.senSuccess(res, 200, "Variant created successfully", variant);
});

// @desc get all variant
exports.getAllvariant = asyncHandeler(async (req, res) => {
  const variant = await variantModel
    .find()
    .populate("product")
    .sort({ createdAt: -1 });
  if (!variant) {
    throw new customError(500, "Variant not found");
  }
  console.log(variant);
  apiResponse.senSuccess(res, 200, "Variant created successfully", variant);
});

// @desc get single variant
exports.getSingleVaraint = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  const variant = await variantModel.findOne({ slug }).populate("product");
  if (!variant) {
    throw new customError(404, "Variant not found");
  }
  apiResponse.senSuccess(res, 200, "Variant Found Successfully", variant);
});

// @desc upload image
exports.uploadImageInVariant = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  const variant = await variantModel.findOne({ slug }).populate("product");
  if (!variant) {
    throw new customError(404, "Variant not found");
  }

  const { image } = req.files;
  const pictureurl = await Promise.all(
    image.map((img) => uploadImageColude(img.path))
  );
  variant.image = [...variant.image, ...pictureurl];
  await variant.save();
  apiResponse.senSuccess(res, 200, "Image uploaded successfully", variant);
});
// @desc delete Variant
exports.deleteVariantImage = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw new customError(401, "Slug not found");
  }

  const variant = await variantModel.findOne({ slug });
  const { publicIP } = req.body;

  if (!publicIP) {
    throw new customError(401, "publicIP not found");
  }

  try {
    // Use Promise.all with async/await to handle the promises correctly
    await Promise.all(publicIP.map((id) => deleteCloudinaryFile(id)));
  } catch (error) {
    // If an error occurs during deletion from Cloudinary, throw a custom error
    throw new customError(401, "Variant image delete failed");
  }

  // This code will only run if the Cloudinary deletion was successful
  variant.image = variant.image.filter(
    (img) => !publicIP.includes(img.publicIP)
  );
  await variant.save();

  apiResponse.senSuccess(res, 200, "Image deleted successfully", variant);
});

// @desc update varaiant information
exports.updateVariantInfo = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(401, "Slug Not Found");
  }
  const preVvariant = await variantModel.findOne({ slug });
  if (!preVvariant) {
    throw new customError(401, "Variant not found");
  }

  const ismatched = preVvariant.product.toString() === req.body.product;

  const updatedVariantInfo = await variantModel.findOneAndUpdate(
    { slug },
    req.body,
    { new: true }
  );


  if (ismatched) {
  await productModel.findOneAndUpdate(
    { _id: preVvariant.product },
    { $pull: { variant: preVvariant._id } },
    { new: true }
  );
    // add variant to new product
    await productModel.findOneAndUpdate(
      { _id: req.body.product },
      {$push: {variant: preVvariant._id}},
      { new: true }
    )
  }

if(!updatedVariantInfo){
  throw new customError(500,"Variant info not updated")
}
apiResponse.senSuccess(res, 200, "Variant info updated successfully", updatedVariantInfo);

});
