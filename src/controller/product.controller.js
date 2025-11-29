const { asyncHandeler } = require("../utils/asyncHandeler");
const productModel = require("../models/product.model.js");
const {
  uploadImageColude,
  deleteCloudinaryFile,
} = require("../helpers/Coludinary");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const { validateProduct } = require("../validation/product.validation.js");
const { generateProductqrcode } = require("../helpers/qrCodeGenerator.js");
const { barcodeGenerator } = require("../helpers/barcodeGenerator.js");
const subcategoryModel = require("../models/Subcategory.model.js");
// @desc create product function
exports.createProduct = asyncHandeler(async (req, res) => {
  // Validate request body
  const data = await validateProduct(req);
  if (!data) {
    throw new customError(400, "validation failed");
  }

  let AllImageArray = [];

  // Only process images if provided
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    for (let image of data.images) {
      // image.path থাকতে হবে
      if (image?.path) {
        const imageAsset = await uploadImageColude(image.path);
        AllImageArray.push(imageAsset);
      }
    }
  }

  // Save to database (image থাকলে array যাবে, না থাকলে empty array)
  const product = await productModel.create({
    ...data,
    image: AllImageArray,
  });

  if (!product) {
    throw new customError(404, "Product not created");
  }
  const subcategory = await subcategoryModel.findOneAndUpdate(
    { _id: data.subCategory },
    { $push: { product: product._id } },
    { new: true }
  );

  if (!subcategory) {
    throw new customError(501, "Product created failed!");
  }
  // Generate QR code
  const qrcodelink = `${process.env.FONT_END_URL}`;
  const qrCode = await generateProductqrcode(qrcodelink);

  // Generate barcode
  const barcodeText = `${product.sku}-${product.name.slice(0, 3)}-${new Date()
    .toString()
    .slice(0, 4)}`;
  const barcode = await barcodeGenerator(barcodeText);

  product.qrCode = qrCode;
  product.barCode = barcode;

  await product.save();

  apiResponse.senSuccess(res, 201, "Product created successfully", product);
});

// @desc get all product
exports.getAllProducts = asyncHandeler(async (req, res) => {
  const { sort, type } = req.query;
  let sortquery = {};
  let typeQuery = {};

  if (sort === "created-descending") {
    sortquery = { createdAt: -1 };
  } else if (sort === "created-ascending") {
    sortquery = { createdAt: 1 };
  } else if (sort === "price-ascending") {
    sortquery = { retailPrice: 1 };
  } else if (sort === "price-descending") {
    sortquery = { retailPrice: -1 };
  } else if (sort === "alfa-ascending") {
    sortquery = { name: 1 };
  } else if (sort === "alfa-descending") {
    sortquery = { name: -1 };
  }

  if (type === "single") {
    typeQuery = { variantType: "SingleVariant" };
  } else if (type === "multi") {
    typeQuery = { variantType: "MultipleVariant" };
  }

  // if (type == "single") {
  //   typeQuery = { variantType: "SingleVariant" };
  // } else if (type == "multi") {
  //   typeQuery = { variantType: "MultipleVariant" };
  // }
  const products = await productModel
    .find(typeQuery)
    .sort(sortquery)
    .populate("category")
    .populate("brand")
    .populate("variant");

  if (!products || products.length === 0) {
    throw new customError(404, "No products found");
  }
  apiResponse.senSuccess(res, 200, "Products fetched successfully", products);
});

// @desc get single product
exports.getSingleProduct = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  const product = await productModel.findOne({ slug });
  if (!product) {
    throw new customError(404, "Product not found");
  }
  apiResponse.senSuccess(res, 200, "Product fetched successfully", product);
});

// @desc update single product

exports.updateProduct = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  const previouseProduct = await productModel.findOne({ slug });
  if (!previouseProduct) {
    throw new customError(404, "Product not found");
  }
  const oldImageIds = previouseProduct.image.map((img) => img.publicIP);
  const updateData = await validateProduct(req);
  if (updateData.images && updateData.images.length > 0) {
    let uploadedImages = [];
    for (let image of updateData.images) {
      const imageAsset = await uploadImageColude(image.path);
      uploadedImages.push(imageAsset);
    }

    updateData.image = uploadedImages;
    delete updateData.images;
  }

  const updatedProduct = await productModel.findOneAndUpdate(
    { slug },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (updatedProduct && updateData.image) {
    for (const publicId of oldImageIds) {
      await deleteCloudinaryFile(publicId);
    }
  }

  apiResponse.senSuccess(
    res,
    200,
    "Product updated successfully",
    updatedProduct
  );
});

// @desc image upload and delete

exports.updateandDeleteImage = asyncHandeler(async (req, res) => {
  const { slug } = req.params;
  const previouseProduct = await productModel.findOne({ slug });
  if (!previouseProduct) {
    throw new customError(404, "Product not found");
  }

  if (req.body.imageurl) {
    for (let imgId of req.body.imageurl) {
      await deleteCloudinaryFile(imgId);
      previouseProduct.image = previouseProduct.image.filter(
        (img) => img.publicIP !== imgId
      );
    }
  }
  await previouseProduct.save();

  let imageurl = [];

  for (let file of req.files.image) {
    const imageAsset = await uploadImageColude(file.path);
    imageurl.push(imageAsset);
  }

  if (imageurl.length > 0) {
    previouseProduct.image.push(...imageurl);
    await previouseProduct.save();
  }

  apiResponse.senSuccess(
    res,
    200,
    "Product updated successfully",
    previouseProduct
  );
});

// @desc delete product

exports.deleteProduct = asyncHandeler(async (req, res) => {
  const { slug } = req.params;

  // First find the product to get image details before deletion
  const product = await productModel.findOne({ slug });
  if (!product) {
    throw new customError(404, "Product not found");
  }

  if (product.image && product.image.length > 0) {
    for (const img of product.image) {
      try {
        await deleteCloudinaryFile(img.publicIP); // or img.public_id depending on your structure
        console.log(`Deleted image: ${img.publicIP}`);
      } catch (error) {
        console.error(`Failed to delete image ${img.publicIP}:`, error);
        // Continue with other images even if one fails
      }
    }
  }

  await productModel.findOneAndDelete({ slug });

  apiResponse.senSuccess(
    res,
    200,
    "Product and associated images deleted successfully",
    product
  );
});

// @desc filter product by category

exports.getProductByCategory = asyncHandeler(async (req, res) => {
  console.log(req.query);
  const { category, subcategory, brand, minPrice, maxPrice, tag } = req.query;
  let filterQuery = {};

  if (category) {
    filterQuery = { ...filterQuery, category: category };
  }
  if (subcategory) {
    filterQuery = { ...filterQuery, subCategory: subcategory };
  }
  if (brand) {
    if (Array.isArray(brand)) {
      filterQuery = { ...filterQuery, brand: { $in: brand } };
    }

    filterQuery = { ...filterQuery, brand: brand };
  } else {
    filterQuery = {};
  }
  if (tag) {
    if (Array.isArray(tag)) {
      filterQuery = { ...filterQuery, tag: { $in: tag } };
    }

    filterQuery = { ...filterQuery, tag: tag };
  } else {
    filterQuery = {};
  }

  const product = await productModel
    .find([
      { ...filterQuery },
      { retailPrice: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
    ])
    .sort({ createdAt: -1 });
  apiResponse.senSuccess(res, 200, "Product fetched successfully", product);
});

// @desc filter price range
exports.filterPriceRange = asyncHandeler(async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  if (!minPrice || !maxPrice) {
    throw new customError(400, "Min and max price are required");
  }

  //---> this function will filter
  // $get ---> greater then or equal
  // $lte ---> less than or equal

  const product = await productModel.find({
    retailPrice: { $gte: Number(minPrice), $lte: Number(maxPrice) },
  });

  if (!product) {
    throw new customError(400, "Product not found in your range!!");
  }
  apiResponse.senSuccess(res, 200, "Product fetched successfully", product);
});

// @desc filter by brand

exports.filterbyBrand = asyncHandeler(async (req, res) => {
  const { brand } = req.query;

  if (!brand) {
    throw new customError(400, "Brand parameter is required");
  }
  const brands = brand.split(",").map((b) => b.trim());

  const products = await productModel
    .find({ brand: { $in: brands } })
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
    })
    .populate({
      path: "brand",
    });

  apiResponse.senSuccess(res, 200, "Product fetched successfully", product);
});

//@desc prodcut pagination

exports.productPagination = asyncHandeler(async (req, res) => {
  const { limit = 1, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const products = await productModel
    .find()
    .skip(Number(skip))
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
    })
    .populate({
      path: "brand",
    });
  apiResponse.senSuccess(res, 200, "Product fetched successfully", {
    products,
    page: Number(page),
    limit: Number(limit),
    totalPage: Math.ceil((await productModel.countDocuments()) / limit),
  });
});

// @desc search by product name or sku
exports.searchProduct = asyncHandeler(async (req, res) => {
  const { name, sku } = req.query;
  if (!name && !sku) {
    throw new customError(400, "name or sku is required");
  }
  const products = await productModel
    .find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { sku: { $regex: sku, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
    })
    .populate({
      path: "brand",
    });
  apiResponse.senSuccess(res, 200, "Product fetched successfully", products);
});
