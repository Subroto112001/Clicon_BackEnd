const { customError } = require("../utils/customError");
const Joi = require("joi");

const brandValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Brand name is required",
    "any.required": "Brand name is required",
    "string.trim": "Brand name should not contain extra spaces",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateBrand = async (req) => {
  try {
    const value = await brandValidationSchema.validateAsync(req.body);

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];

    /**
     * @desc Check if file exists
     */
    
    if (!req.files?.image || req.files?.image?.length === 0) {
      throw new customError(401, "Brand image not found");
    }

    const imageFile = req.files.image[0];

    /**
     * @desc Check MIME type
     */
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      throw new customError(
        401,
        "Only JPG, JPEG, PNG and GIF files are allowed"
      );
    }

    /**
     * @desc Check file size (max 5MB)
     */
    if (imageFile.size >= 5 * 1024 * 1024) {
      throw new customError(401, "Image size must be below 5MB");
    }

    return { name: value.name, image: imageFile };
  } catch (error) {
    if (error.details) {
      console.log("Error from brand validation:", error.details[0].message);
      throw new customError(
        404,
        `Brand validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error from validateBrand:", error);
      throw new customError(401, `Brand validation failed: ${error.message}`);
    }
  }
};
