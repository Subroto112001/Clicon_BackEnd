const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateCategory } = require("../validation/category.validation");
const categorymodel = require("../models/category.model");
const {
  uploadImageColude,
  deleteColudinaryImage,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");

// @desc create category function
exports.createCategory = asyncHandeler(async (req, res) => {
  const value = await validateCategory(req);
  console.log(value);
  const cloudeImage = await uploadImageColude(value?.image?.path);

  //  save the category into database

  const category = await categorymodel.create({
    name: value.name,
    image: cloudeImage,
  });

  if (!category) {
    throw new customError(501, "Category created failed!");
  }
  apiResponse.senSuccess(res, 201, "Category created successfully", category);
});

// @desc get all category function
exports.getAllCategory = asyncHandeler(async (req, res) => {
  // pipeline aggregration
  const allCategory = await categorymodel.aggregate([
    {
      $lookup: {
        from: "subcategories", // database model name
        localField: "subCategory", //category holder name
        foreignField: "_id", // subcategory model id
        as: "subCategoryholder", // wich name you will sotre it
      },
    },
    {
      $project: {
        name: 1,
        image: 1,
        isActive: 1,
        createdAt: 1,
        slug: 1,
        subCategoryholder: 1,
      },
    },
    {$sort: {createdAt: -1}}
  ]);

  // error throw

  if (!allCategory) {
    throw new customError(404, "No categories found");
  }

  console.log(allCategory);
  // response

  apiResponse.senSuccess(
    res,
    200,
    "All categories retrieved successfully",
    allCategory
  );
});

// @desc get single category function
exports.getSingleCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  const SingleCategoryItem = await categorymodel
    .findOne({ slug })
    .populate("subCategory");
  if (!SingleCategoryItem) {
    throw new customError(500, "No category found here");
  }
  console.log(SingleCategoryItem);

  apiResponse.senSuccess(
    res,
    200,
    "Single category retrieved successfully",
    SingleCategoryItem
  );
});

// @desc update single category
exports.updateSingleCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug not found !!");
  const foundCAtegory = await categorymodel.findOne({ slug });
  if (!foundCAtegory) throw new customError(501, "Don't Found Any Category !!");

  if (req.body.name) {
    foundCAtegory.name = req.body.name;
  }
  if (req?.files.image?.length) {
    // delete
    const deletedItem = await deleteCloudinaryFile(
      foundCAtegory.image.publicIP
    );
    if (!deletedItem) throw new customError(401, "Image Deletion Failed !!");
    const image = await uploadImageColude(req?.files.image[0].path);
    foundCAtegory.image = image;
  }

  await foundCAtegory.save();
  apiResponse.senSuccess(res, 200, "category update successful", foundCAtegory);
});

// @desc delete single category
exports.deleteSingleCategory = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new customError(401, "Slug Not Found");
  }
  const findCategory = await categorymodel.findOneAndDelete({ slug });

  if (!findCategory) {
    throw new customError(404, " Category not found");
  }

  // now delete here the category

  const deletedCategoryItem = await deleteCloudinaryFile(
    findCategory.image.publicIP
  );
  if (!deletedCategoryItem) {
    throw new customError(401, "Image Deletion Failed !!");
  }

  apiResponse.senSuccess(
    res,
    200,
    "Category deleted successfully",
    findCategory
  );
});
