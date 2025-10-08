const { customError } = require("../utils/customError");
const Joi = require("joi");

/**
 * @desc Cart Validation Schema
 */
const cartValidationSchema = Joi.object({
  user: Joi.string().allow(null, "").messages({
    "string.base": "User ID must be a valid string",
  }),

  guestId: Joi.string().allow(null, "").messages({
    "string.base": "Guest ID must be a valid string",
  }),

  product: Joi.string().trim().optional().allow(null, "").messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
    "string.trim": "Product ID should not contain extra spaces",
  }),

  variant: Joi.string().allow(null, "").messages({
    "string.base": "Variant ID must be a valid string",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),

  color: Joi.string().trim().required().messages({
    "string.empty": "Color is required",
    "any.required": "Color is required",
  }),

  size: Joi.string().trim().required().messages({
    "string.empty": "Size is required",
    "any.required": "Size is required",
  }),

  coupon: Joi.string().allow(null, "").messages({
    "string.base": "Coupon ID must be a valid string",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

/**
 * @desc Validate Cart Data
 */
exports.validateCart = async (req) => {
  try {
    const value = await cartValidationSchema.validateAsync(req.body);

    // ✅ Additional logical checks (if needed)
    if (!value.user && !value.guestId) {
      throw new customError(401, "Either user or guestId must be provided");
    }

    return value;
  } catch (error) {
    if (error.details) {
      console.log("Error from cart validation:", error.details[0].message);
      throw new customError(
        404,
        `Cart validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateCart:", error);
      throw new customError(401, `Cart validation failed: ${error.message}`);
    }
  }
};
