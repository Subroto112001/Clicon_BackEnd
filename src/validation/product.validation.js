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
  brand: Joi.string().hex().length(24).allow(null).optional(),
  wholeSaleProfitAmount: Joi.number().max(100).optional(),
  retailProfitAmount: Joi.number().max(100).optional(),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),
  subCategory: Joi.string().optional().allow(null, ""),
  sku: Joi.string().optional().allow(""),
  barCode: Joi.string().optional().allow(""),
  qrCode: Joi.string().optional().allow(""),
  wholeSalePrice: Joi.number().min(0).optional(),
  retailPrice: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  size: Joi.array().items(Joi.string()).optional(),
  color: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  warrantyInformation: Joi.string().optional().allow(""),
  shippingInformation: Joi.string().optional().allow(""),
  manufactureCountry: Joi.string().optional().allow(""),
  groupUnit: Joi.string().optional().allow(""),
  groupUnitQuantity: Joi.number().min(1).optional(),
  unit: Joi.string()
    .valid("Piece", "Kg", "Gram", "Packet", "Custom")
    .optional(),
  warehouseLocation: Joi.string().optional().allow(""),
  alertQuantity: Joi.number().min(4).optional(),
  returnPolicy: Joi.string().optional().allow(""),
  minimumOrderQuantity: Joi.number().min(5).optional(),
  variantType: Joi.string().optional(),
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
    // Parse arrays that might come as JSON strings or FormData arrays
    const bodyData = { ...req.body };

    // Handle arrays that might be sent as JSON strings
    ["tags", "size", "color", "reviews"].forEach((field) => {
      if (bodyData[field]) {
        if (typeof bodyData[field] === "string") {
          try {
            bodyData[field] = JSON.parse(bodyData[field]);
          } catch (e) {
            // If it's not valid JSON, leave it as is and let Joi validate
          }
        }
        // Handle case where FormData sends array items as "field[]"
        if (!Array.isArray(bodyData[field])) {
          bodyData[field] = [bodyData[field]];
        }
      }
    });

    // Convert string numbers to actual numbers
    [
      "wholeSalePrice",
      "retailPrice",
      "stock",
      "groupUnitQuantity",
      "alertQuantity",
      "rating",
      "minimumOrderQuantity",
      "wholeSaleProfitAmount",
      "retailProfitAmount",
    ].forEach((field) => {
      if (bodyData[field] && typeof bodyData[field] === "string") {
        bodyData[field] = Number(bodyData[field]);
      }
    });

    // Validate the processed body data
    const value = await productValidationSchema.validateAsync(bodyData);

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
