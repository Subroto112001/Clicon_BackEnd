const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateCategory } = require("../validation/category.validation");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const subcategoryModel = require("../models/Subcategory.model");
const { validateSubCategory } = require("../validation/Subcategory.validation");
const categoryModel = require("../models/category.model");
// @desc create subcategory function
exports.createsubcategory = asyncHandeler(async (req, res) => {
  const value = await validateSubCategory(req);
  const subcategorydatabase = await subcategoryModel.create(value);
  if (!subcategorydatabase) {
    throw new customError(501, "Subcategory created failed!");
  }

  // now push the subcategory id into category list subcategory field
  const category = await categoryModel.findOneAndUpdate(
    { _id: value.category },
    { $push: { subCategory: subcategorydatabase._id } },
    { new: true }
  );

  console.log(category);

  apiResponse.senSuccess(
    res,
    201,
    "Subcategory created successfully!",
    subcategorydatabase
  );
});

// @desc get all subcategory
exports.getallsubcategory = asyncHandeler(async (req, res) => {
  const getallsubcategory = await subcategoryModel
    .find()
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
      select: "-subCategory",
    });

  if (!getallsubcategory) {
    throw new customError(404, "Subcategory Not found");
  }
  console.log(getallsubcategory);
  apiResponse.senSuccess(
    res,
    200,
    "Subcategory found successfully",
    getallsubcategory
  );
});

// @desc get single category

exports.getSinglesubcategory = asyncHandeler(async (req, res) => {``
  const { slug } = req.params;
  const getSignlesubcategory = await subcategoryModel
    .findOne({ slug })
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
    });

  if (!getSignlesubcategory) {
    throw new customError(404, "Subcategory Not found");
  }
  console.log(getSignlesubcategory);
  apiResponse.senSuccess(
    res,
    200,
    "Subcategory found successfully",
    getSignlesubcategory
  );
});

// @desc update subcategory
exports.updatesubcategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(404, "Subcategory Not found");
  }

  const subcategory = await subcategoryModel.findOne({ slug });
  if (!subcategory) {
    throw new customError(404, "Subcategory Not found");
  }

  if (
    req.body.category &&
    req.body.category.toString() !== subcategory.category.toString()
  ) {
    // remove from old category
    await categoryModel.findOneAndUpdate(
      { _id: subcategory.category },
      { $pull: { subCategory: subcategory._id } }
    );

    // add to new category
    await categoryModel.findOneAndUpdate(
      { _id: req.body.category },
      { $push: { subCategory: subcategory._id } }
    );

    // update reference inside subcategory
    subcategory.category = req.body.category;
  }

  // update name
  subcategory.name = req.body.name || subcategory.name;

  // save updated subcategory
  await subcategory.save();

  apiResponse.senSuccess(
    res,
    200,
    "Subcategory updated successfully",
    subcategory
  );

});

// @desc delete subcategory
exports.deletesubcategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(404, "Subcategory Not found");
  }

  const subcategory = await subcategoryModel.findOne({ slug });
  if (!subcategory) {
    throw new customError(404, "Subcategory Not found");
  }

  // remove from category
  await categoryModel.findOneAndUpdate(
    { _id: subcategory.category },
    { $pull: { subCategory: subcategory._id } }
  );

  // delete subcategory
  await subcategoryModel.deleteOne({ _id: subcategory._id });

  apiResponse.senSuccess(
    res,
    200,
    "Subcategory deleted successfully",
    subcategory
  );

});
