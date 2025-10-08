const Joi = require("joi");

const couponValidationSchema = Joi.object({
  code: Joi.string().trim().lowercase().required().messages({
    "string.empty": "Coupon code is required",
    "any.required": "Coupon code is required",
    "string.trim": "Coupon code should not contain extra spaces",
  }),

  expire: Joi.date().greater("now").required().messages({
    "date.base": "Expire date must be a valid date",
    "date.greater": "Expire date must be in the future",
    "any.required": "Expire date is required",
  }),

  usageLimit: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.base": "Usage limit must be a number",
    "number.min": "Usage limit must be at least 1",
    "number.max": "Usage limit cannot exceed 100",
  }),

  useCount: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Use count must be a number",
    "number.min": "Use count cannot be negative",
  }),

  isActive: Joi.boolean().default(true),

  discountType: Joi.string()
    .valid("percentage", "fixedvalue")
    .required()
    .messages({
      "any.only": "Discount type must be either 'percentage' or 'fixedvalue'",
      "any.required": "Discount type is required",
    }),

  discountValue: Joi.number().positive().required().messages({
    "number.base": "Discount value must be a number",
    "number.positive": "Discount value must be a positive number",
    "any.required": "Discount value is required",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateCoupon = async (req, res, next) => {
  try {
    await couponValidationSchema.validateAsync(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
