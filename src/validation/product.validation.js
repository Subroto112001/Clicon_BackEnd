const { customError } = require("../utils/customError");
const Joi = require("joi");

// ---------------------------
// Product Validation Schema
// ---------------------------
const productValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
    "string.trim": "Product name should not contain extra spaces",
  }),

  description: Joi.string().allow("").optional(),
  brand: Joi.string().hex().length(24).allow(null),
  wholeSaleProfitAmount: Joi.number().max(100).optional(),
  retailProfitAmount: Joi.number().max(100).optional(),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),
  tags: Joi.array().items(Joi.string()).optional(),
  reviews: Joi.array().items(Joi.string()).optional(),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

// ---------------------------
// Product Validation Function
// ---------------------------
exports.validateProduct = async (req) => {
  try {
    // First, validate the text fields from req.body
    const value = await productValidationSchema.validateAsync(req.body);

    // Create an object to hold all data to be updated
    let dataToUpdate = { ...value };

    // Check if new images were actually uploaded
    if (req.files && req.files.image && req.files.image.length > 0) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      const images = req.files.image;

      for (const imageFile of images) {
        // Check MIME type
        if (!allowedMimeTypes.includes(imageFile.mimetype)) {
          throw new customError(
            401,
            "Only JPG, JPEG, PNG and GIF files are allowed"
          );
        }

        // Check file size (max 5MB)
        if (imageFile.size >= 5 * 1024 * 1024) {
          throw new customError(401, "Image size must be below 5MB");
        }
      }

      // If validation passes, add the new images to our data object
      dataToUpdate.images = req.files.image;
    }

    // Return the combined data (body + optional images)
    return dataToUpdate;
  } catch (error) {
    if (error.details) {
      console.log("Error from product validation:", error.details[0].message);
      throw new customError(
        404,
        `Product validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateProduct:", error);
      throw new customError(401, `Product validation failed: ${error.message}`);
    }
  }
};