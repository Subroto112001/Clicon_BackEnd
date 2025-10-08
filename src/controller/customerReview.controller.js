const { asyncHandeler } = require("../utils/asyncHandeler");
const productModel = require("../models/product.model.js");
const {
  uploadImageColude,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const {
  validateReview,
} = require("../validation/customerReview.validation.js");

// @desc create a customer review
exports.createCustomerReview = asyncHandeler(async (req, res) => {
  const reviewdata = await validateReview(req);
  console.log(reviewdata);
  const imageUrl = await Promise.all(
    reviewdata.images.map((img) => uploadImageColude(img.path))
  );

  const newReview = await productModel.findOneAndUpdate(
    { _id: reviewdata.product },
    {
      $push: {
        reviews: {
          ...reviewdata,
          image: imageUrl,
        },
      },
    },
    { new: true }
  );

  if (!newReview) {
    throw new customError("404", "Product not found");
  }

  apiResponse.senSuccess(res, 200, "Review added successfully", newReview);
});

// @desc delete customer review
exports.deleteCustomerReview = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  const { reviewId } = req.body;

  if (!slug && reviewId) {
    throw new customError(400, "Slug and reviewId are required");
  }

  const review = await productModel.findOneAndUpdate(
    { slug },
    { $pull: { reviews: { _id: reviewId } } },
    { new: true }
  );

  if (!review) {
    throw new customError(404, "Review is not found");
  }
  apiResponse.senSuccess(res, 200, "Review deleted successfully", review);
});

// @desc edit customer review
exports.editCustomerReview = asyncHandeler(async (req, res) => {
  const { reviewId, comment } = req.body;
  if (!reviewId) {
    throw new customError(400, "ReviewId is required");
  }
  const review = await productModel.findOne({
    reviews: { $elemMatch: { _id: reviewId } },
  });
  if (!review) {
    throw new customError(404, "Review is not found");
  }

    const updatedReview = review.reviews.map((rev) => {
      if (rev._id.toString() === reviewId) {
        rev.comment = comment
      }
      return rev;
    });
 
    review.reviews = updatedReview;
    await review.save();
  apiResponse.senSuccess(
    res,
    200,
    "Review updated successfully",
    updatedReview
   );
});
