const { customError } = require("../utils/customError");
const Joi = require("joi");

const subCategoryValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "SubCategory name is required",
    "any.required": "SubCategory name is required",
    "string.trim": "SubCategory name should not contain extra spaces",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category ID is required",
    "any.required": "Category ID is required",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateSubCategory = async (req) => {
  try {
    const value = await subCategoryValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    throw new customError(
      404,
      `SubCategory validation failed: ${error.details[0].message}`
    );
  }
};
