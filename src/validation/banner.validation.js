const Joi = require("joi");
const { customError } = require("../utils/customError");

const bannerValidationSchema = Joi.object(
  {
    title: Joi.string().trim().min(3).max(100).required().messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "any.required": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 100 characters",
    }),

    description: Joi.string().trim().allow(null, "").max(500).messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not exceed 500 characters",
    }),

    targetUrl: Joi.string().uri().allow("", null).messages({
      "string.uri": "Target URL must be a valid URL",
    }),

    targetType: Joi.string()
      .valid("product", "category", "brand", "external")
      .default("external")
      .messages({
        "any.only":
          "Target type must be one of product, category, brand, or external",
      }),

    priority: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Priority must be a number",
      "number.min": "Priority cannot be negative",
    }),

    isActive: Joi.boolean().default(true),

    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
  },
  { abortEarly: true }
).unknown(true);

// ✅ Validate Banner Information
exports.validateBanner = async (req) => {
  try {
    // Validate text fields
    const value = await bannerValidationSchema.validateAsync(req.body);

    // Validate image
    const image = req?.files?.image?.[0];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (req?.files?.image?.length > 1) {
      throw new customError(401, "Image must be a single file");
    }

    if (image?.size > 2 * 1024 * 1024) {
      throw new customError(401, "Image size must be below 2MB");
    }

    if (image && !allowFormat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "Image format not accepted. Try jpg, jpeg, png, or webp"
      );
    }

    return {
      title: value.title,
      description: value.description,
      targetUrl: value.targetUrl || "",
      targetType: value.targetType || "external",
      priority: value.priority || 0,
      isActive: value.isActive ?? true,
      startDate: value.startDate || null,
      endDate: value.endDate || null,
      image: image || null,
    };
  } catch (error) {
    if (!error.details) {
      throw new customError(401, error.message || error);
    } else {
      throw new customError(
        401,
        error.details.map((item) => item.message).join(", ")
      );
    }
  }
};
