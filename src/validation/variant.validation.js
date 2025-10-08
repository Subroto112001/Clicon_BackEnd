const { customError } = require("../utils/customError");
const Joi = require("joi");

const variantValidationSchema = Joi.object({
  product: Joi.string().trim().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),

  variantName: Joi.string().trim().required().messages({
    "string.empty": "Variant name is required",
    "any.required": "Variant name is required",
    "string.trim": "Variant name should not contain extra spaces",
  }),

  retailPrice: Joi.number().required().messages({
    "number.base": "Retail price must be a number",
    "any.required": "Retail price is required",
  }),

  wholeSalePrice: Joi.number().required().messages({
    "number.base": "Wholesale price must be a number",
    "any.required": "Wholesale price is required",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateVariant = async (req) => {
  try {
    const value = await variantValidationSchema.validateAsync(req.body);

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];

    /**
     * @desc: check if image exists
     */
    if (!req?.files?.image || req.files.image.length === 0) {
      throw new customError(401, "Image is required");
    }

    /**
     * @desc: check mimetype
     */
    if (!allowedMimeTypes.includes(req.files.image[0].mimetype)) {
      throw new customError(
        400,
        "Only JPG, JPEG, PNG, and GIF image files are allowed"
      );
    }

    /**
     * @desc: check file size (max 5MB)
     */
    if (req.files.image[0].size >= 5 * 1024 * 1024) {
      throw new customError(401, "Image size must be below 5MB");
    }

    value.image = req.files.image;
    return value
  } catch (error) {
    if (error.details) {
      console.log("Error from variant validation", error.details[0].message);
      throw new customError(
        404,
        `Variant validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateVariant:", error);
      throw new customError(
        401,
        `Variant validation failed : ${error.message}`
      );
    }
  }
};
