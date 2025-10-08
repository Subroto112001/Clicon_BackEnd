const { customError } = require("../utils/customError");
const Joi = require("joi");

const categoryValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
    "string.trim": "Category name should not contain extra spaces",
  }),
}).options({
  abortEarly: true,
  allowUnknown: true,
});

exports.validateCategory = async (req) => {
  try {
    const value = await categoryValidationSchema.validateAsync(req.body);

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];

    /**
     *@desc: here check mimetype
     */

    if (!allowedMimeTypes.includes(req?.files?.image[0]?.mimetype)) {
      return cb(
        new customError("Only JPG, JPEG, and PNG image files are allowed")
      );
    }

    /**
     *@desc: here check file length
     */
    if (req.files?.length == 0) {
      throw new customError(401, "Image not found");
    }

    /**
     *@desc: here check file size
     */

    if (req?.files?.image[0]?.size >= 10*1024 *1024) {
      throw new customError(401, "image size below 5MB");
    }

    return {name: value.name, image : req?.files?.image[0]};
  } catch (error) {
    if (error.details) {
      console.log("Error from category validation", error.details[0].message);
      throw new customError(
        404,
        `Category validation failed: ${error.details[0].message}`
      );
    } else {
      console.log("Error form validatecategory:", error);
      throw new customError(
        401,
        `category validation failed : ${error.message}`
      );
    }
  }
};
