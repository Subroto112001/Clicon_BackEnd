const { customError } = require("../utils/customError");
const Joi = require("joi");

// ---------------------------
// Review Validation Schema
// ---------------------------
const reviewValidationSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    "any.required": "Rating is required",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
  }),

  reviewer: Joi.string().hex().length(24).optional().allow(null),

  comment: Joi.string().trim().allow("").messages({
    "string.trim": "Comment should not contain extra spaces",
  }),

  product: Joi.string().hex().length(24).required().messages({
    "any.required": "Product is required",
    "string.hex": "Invalid Product ID format",
  }),
  image:[{}]
}).options({
  abortEarly: true,
  allowUnknown: true,
});

// ---------------------------
// Review Validation Function
// ---------------------------
exports.validateReview = async (req) => {
  try {
    // Validate body data
    const value = await reviewValidationSchema.validateAsync(req.body);

    // Prepare final object
    let dataToSave = { ...value };

    // Check if review images were uploaded
    if (req.files && req.files.image && req.files.image.length > 0) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      const images = req.files.image;

      for (const imageFile of images) {
        if (!allowedMimeTypes.includes(imageFile.mimetype)) {
          throw new customError(
            401,
            "Only JPG, JPEG, PNG and GIF files are allowed"
          );
        }

        if (imageFile.size >= 5 * 1024 * 1024) {
          throw new customError(401, "Image size must be below 5MB");
        }
      }

      // Add images to final object
      dataToSave.images = req.files.image;
    }

    return dataToSave;
  } catch (error) {
    if (error.details) {
      console.log("Error from review validation:", error.details[0].message);
      throw new customError(
        404,
        `Review validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateReview:", error);
      throw new customError(401, `Review validation failed: ${error.message}`);
    }
  }
};
