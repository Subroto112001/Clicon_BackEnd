const { customError } = require("../utils/customError");
const Joi = require("joi");

// ---------------------------
// Discount Validation Schema
// ---------------------------
const discountValidationSchema = Joi.object({
  discountValidFrom: Joi.date().required().messages({
    "any.required": "Discount start date is required",
    "date.base": "Discount start date must be a valid date",
  }),

  discountValidTo: Joi.date().required().messages({
    "any.required": "Discount end date is required",
    "date.base": "Discount end date must be a valid date",
  }),

  discountName: Joi.string().trim().required().messages({
    "string.empty": "Discount name is required",
    "any.required": "Discount name is required",
    "string.trim": "Discount name should not contain extra spaces",
  }),

  discountType: Joi.string().valid("tk", "percentage").required().messages({
    "any.only": "Discount type must be either 'tk' or 'percentage'",
    "any.required": "Discount type is required",
  }),

  discountValueByAmount: Joi.number().min(0).optional(),

  discountValueByPercentage: Joi.number().min(0).max(100).optional().messages({
    "number.max": "Percentage value cannot be more than 100",
  }),

  discountPlan: Joi.string()
    .valid("category", "subCategory", "product")
    .required()
    .messages({
      "any.only": "Discount plan must be category, subCategory, or product",
      "any.required": "Discount plan is required",
    }),

}).options({
  abortEarly: true,
  allowUnknown: true,
});

// ---------------------------
// Discount Validation Function
// ---------------------------
exports.validateDiscount = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);

    // 🔹 Extra: Validate logical flow
    if (value.discountValidFrom && value.discountValidTo) {
      if (new Date(value.discountValidFrom) > new Date(value.discountValidTo)) {
        throw new customError(
          400,
          "Discount start date cannot be after end date"
        );
      }
    }

    // 🔹 If discountType is percentage, discountValueByPercentage is required
    if (
      value.discountType === "percentage" &&
      !value.discountValueByPercentage
    ) {
      throw new customError(400, "Percentage discount value is required");
    }

    // 🔹 If discountType is tk, discountValueByAmount is required
    if (value.discountType === "tk" && !value.discountValueByAmount) {
      throw new customError(400, "Amount discount value is required");
    }

    return value;
  } catch (error) {
    if (error.details) {
      console.log("Error from discount validation:", error.details[0].message);
      throw new customError(
        404,
        `Discount validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateDiscount:", error);
      throw new customError(
        401,
        `Discount validation failed: ${error.message}`
      );
    }
  }
};
