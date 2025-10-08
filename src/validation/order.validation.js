const Joi = require("joi");
const { customError } = require("../utils/customError");

/**
 * @desc Joi validation schema for creating an Order
 */
const orderValidationSchema = Joi.object({
  user: Joi.string().optional().allow(null),

  guestId: Joi.string().optional().allow(null),

  shippingInfo: Joi.object({
    fullname: Joi.string().optional().allow(""),
    phone: Joi.string().trim().required().messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),
    address: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
  })
    .required()
    .messages({
      "object.base": "Shipping info must be a valid object",
      "any.required": "Shipping info is required",
    }),

  deliveryCharge: Joi.string().trim().required().messages({
    "string.empty": "Delivery charge ID is required",
    "any.required": "Delivery charge ID is required",
  }),

  paymentMethod: Joi.string().valid("cod", "sslcommerse").required().messages({
    "any.only": "Payment method must be either 'cod' or 'sslcommerse'",
    "any.required": "Payment method is required",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

/**
 * @desc Validate order data
 */
exports.validateOrder = async (req) => {
  try {
    const value = await orderValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    if (error.details) {
      console.log("Error from order validation:", error.details[0].message);
      throw new customError(
        404,
        `Order validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateOrder:", error);
      throw new customError(401, `Order validation failed: ${error.message}`);
    }
  }
};
