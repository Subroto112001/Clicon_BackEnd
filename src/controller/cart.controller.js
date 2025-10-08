const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateCategory } = require("../validation/category.validation");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const variantMOdel = require("../models/variant.model");
const { validateCart } = require("../validation/cart.validation");
const couponModel = require("../models/cupon.model");
const { getIo } = require("../Socket/server");

// apply coupon to calculate discount price
const applyCoupn = async (totalPrice = 0, couponCode = "") => {
  if (couponCode == null) {
    return { finalAmount: totalPrice, discountinfo: {} };
  }

  try {
    let finalAmount = 0;
    let discountinfo = {};
    const coupon = await couponModel.findOne({ code: couponCode });
    if (!coupon) {
      throw new customError(401, "Coupon not found");
    }
    if (Date.now() > coupon.expire) {
      throw new customError(401, "Coupon is expired");
    }
    if (coupon.usageLimit < coupon.useCount) {
      throw new customError(401, "Coupon usage limit exceeded");
    }

    if (coupon.discountType === "percentage") {
      const discountAmount = (totalPrice * coupon.discountValue) / 100;
      finalAmount = totalPrice - discountAmount;
      coupon.useCount += 1;
      discountinfo.discountType = "percentage";
      discountinfo.discountValue = discountAmount;
    }
    if (coupon.discountType === "tk") {
      const discountAmount = coupon.discountValue;

      finalAmount = totalPrice - discountAmount;
      coupon.useCount += 1;

      discountinfo.discountType = "tk";
      discountinfo.discountValue = discountAmount;
    }
    discountinfo.couponId = coupon._id;
    discountinfo.discountAmount = coupon.discountValue;

    await coupon.save();
    return { finalAmount, discountinfo };
  } catch (error) {
    console.error("Error:", error);
    throw new customError(401, "Coupon is not valid", error);
  }
};

// @desc Add to cart
exports.addToCart = asyncHandeler(async (req, res) => {
  const value = await validateCart(req);
  const { user, guestId, product, variant, quantity, coupon, color, size } =
    value;

  let productObj = null;
  let variantObj = null;
  let price = 0;

  // extract price from product or variant
  if (product) {
    productObj = await productModel.findById(product);
    price = productObj.retailPrice;
  }
  if (variant) {
    variantObj = await variantMOdel.findById(variant);
    price = variantObj.retailPrice;
  }

  // FIX 1: Remove the extra object wrapper
  const cartQuery = user ? { user: user } : { guestId: guestId };
  let cart = await cartModel.findOne(cartQuery);

  if (!cart) {
    cart = new cartModel({
      user: user || null,
      guestId: guestId || null,
      items: [],
      coupon: coupon || null,
    });
  }

  // FIX 2: Compare ObjectIds correctly using .toString() or .equals()
  let findIndex = -1;
  if (productObj) {
    findIndex = cart.items.findIndex(
      (item) =>
        item.product && item.product.toString() === productObj._id.toString()
    );
  }
  if (variantObj) {
    findIndex = cart.items.findIndex(
      (item) =>
        item.variant && item.variant.toString() === variantObj._id.toString()
    );
  }

  // FIX 3: Correct the price calculation logic
  if (findIndex > -1) {
    // Update existing item
    cart.items[findIndex].quantity += quantity;
    cart.items[findIndex].totalPrice = Math.ceil(
      price * cart.items[findIndex].quantity
    );
  } else {
    // Add new item
    cart.items.push({
      product: product ? product : null,
      variant: variant ? variant : null,
      quantity: quantity,
      price: price,
      totalPrice: Math.ceil(price * quantity),
      color: color,
      size: size,
    });
  }

  // now calculate total amount and quantity
  const totalCalculatedReducePrice = cart.items.reduce(
    (accumulator, item) => {
      accumulator.totalPrice += item.totalPrice;
      accumulator.totalQuantity += item.quantity;
      return accumulator;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  // if user have coupon
  const { finalAmount, discountinfo } = await applyCoupn(
    totalCalculatedReducePrice.totalPrice,
    coupon
  );

  // @desc now update the cart database
  cart.coupon = discountinfo.couponId;
  cart.totalSubtotal = totalCalculatedReducePrice.totalPrice;
  cart.totalQuantity = totalCalculatedReducePrice.totalQuantity;
  cart.finalAmount = finalAmount;
  cart.discountType = discountinfo.discountType || null;
  cart.discountPrice = discountinfo.discountValue || null;
  cart.discountAmount = discountinfo.discountAmount;

  await cart.save();
  const io = getIo();
  io.to("123").emit("cart", {
    message: "Product added to cart successfully",
    cart: cart,
  });

  return apiResponse.senSuccess(
    res,
    201,
    "Product added to cart successfully",
    cart
  );
});

// @desc decrease the cart quantity
exports.decreaseQuantity = asyncHandeler(async (req, res) => {
  const userid = req.userid || req.body.userid;
  const { guestId, cartItemId } = req.body;
  if (!cartItemId) {
    throw new customError(400, "Cart item id is missing!");
  }
  // Build query - ensure we have either userid or guestId
  if (!userid && !guestId) {
    throw new customError(400, "User ID or Guest ID is required");
  }

  const query = userid ? { user: userid } : { guestId: guestId };
  const cart = await cartModel.findOne(query);
  if (!cart) {
    throw new customError(404, "Cart not found for this user");
  }
  // Find the cart item index using proper ObjectId comparison
  const index = cart.items.findIndex(
    (item) => item._id.toString() === cartItemId.toString()
  );
  if (index === -1) {
    throw new customError(404, "Cart item not found in cart");
  }
  const cartItem = cart.items[index];
  // Decrease quantity or remove item if quantity becomes 0
  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
    cartItem.totalPrice = Math.ceil(cartItem.price * cartItem.quantity);
  } else {
    // Remove item if quantity would be 0
    cart.items.splice(index, 1);
  }
  // Recalculate total price and quantity
  const totalCalculated = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  // Update cart without reapplying coupon (to avoid incrementing useCount)
  cart.totalSubtotal = totalCalculated.totalPrice;
  cart.totalQuantity = totalCalculated.totalQuantity;
  // Recalculate discount if coupon exists
  if (cart.coupon && totalCalculated.totalPrice > 0) {
    // Get coupon details without incrementing useCount
    const coupon = await couponModel.findById(cart.coupon);
    if (coupon && Date.now() <= coupon.expire) {
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount =
          (totalCalculated.totalPrice * coupon.discountValue) / 100;
      } else if (coupon.discountType === "tk") {
        discountAmount = coupon.discountValue;
      }
      cart.finalAmount = totalCalculated.totalPrice - discountAmount;
      cart.discountType = coupon.discountType;
      cart.discountPrice = discountAmount;
      cart.discountAmount = coupon.discountValue;
    } else {
      // Coupon expired or not found, remove it
      cart.finalAmount = totalCalculated.totalPrice;
      cart.coupon = null;
      cart.discountType = null;
      cart.discountPrice = null;
      cart.discountAmount = null;
    }
  } else {
    // No coupon or empty cart
    cart.finalAmount = totalCalculated.totalPrice;
  }

  await cart.save();

  const io = getIo();
  io.to("123").emit("cart", {
    message: "Product decreased from cart successfully",
    cart: "getCart",
  });
  return apiResponse.senSuccess(
    res,
    200,
    cart.items.length === 0 || cartItem.quantity === 0
      ? "Item removed from cart successfully"
      : "Cart item quantity decreased successfully",
    cart
  );
});

// @desc increase quantity
exports.increaseQuantity = asyncHandeler(async (req, res) => {
  const userid = req.userid || req.body.userid;
  const { guestId, cartItemId } = req.body;
  if (!cartItemId) {
    throw new customError(400, "Cart item id is missing!");
  }
  // Build query - ensure we have either userid or guestId
  if (!userid && !guestId) {
    throw new customError(400, "User ID or Guest ID is required");
  }
  const query = userid ? { user: userid } : { guestId: guestId };
  const cart = await cartModel.findOne(query);
  if (!cart) {
    throw new customError(404, "Cart not found for this user");
  }
  // Find the cart item index using proper ObjectId comparison
  const index = cart.items.findIndex(
    (item) => item._id.toString() === cartItemId.toString()
  );

  if (index === -1) {
    throw new customError(404, "Cart item not found in cart");
  }

  const cartItem = cart.items[index];

  // Decrease quantity or remove item if quantity becomes 0
  if (cartItem.quantity > 1) {
    cartItem.quantity += 1;
    cartItem.totalPrice = Math.ceil(cartItem.price * cartItem.quantity);
  } else {
    // Remove item if quantity would be 0
    cart.items.splice(index, 1);
  }

  // Recalculate total price and quantity
  const totalCalculated = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  // Update cart without reapplying coupon (to avoid incrementing useCount)
  cart.totalSubtotal = totalCalculated.totalPrice;
  cart.totalQuantity = totalCalculated.totalQuantity;

  // Recalculate discount if coupon exists
  if (cart.coupon && totalCalculated.totalPrice > 0) {
    // Get coupon details without incrementing useCount
    const coupon = await couponModel.findById(cart.coupon);

    if (coupon && Date.now() <= coupon.expire) {
      let discountAmount = 0;

      if (coupon.discountType === "percentage") {
        discountAmount =
          (totalCalculated.totalPrice * coupon.discountValue) / 100;
      } else if (coupon.discountType === "tk") {
        discountAmount = coupon.discountValue;
      }

      cart.finalAmount = totalCalculated.totalPrice - discountAmount;
      cart.discountType = coupon.discountType;
      cart.discountPrice = discountAmount;
      cart.discountAmount = coupon.discountValue;
    } else {
      // Coupon expired or not found, remove it
      cart.finalAmount = totalCalculated.totalPrice;
      cart.coupon = null;
      cart.discountType = null;
      cart.discountPrice = null;
      cart.discountAmount = null;
    }
  } else {
    // No coupon or empty cart
    cart.finalAmount = totalCalculated.totalPrice;
  }

  await cart.save();

  const io = getIo();
  io.to("123").emit("cart", {
    message: "Product increased in cart successfully",
    cart: "getCart",
  });
  return apiResponse.senSuccess(res, 200, "Cart Increase Successfully", cart);
});

// @desc delete cartItem
exports.deleteCartItem = asyncHandeler(async (req, res) => {
  const userid = req.userid || req.body.userid;
  const { guestId, cartID } = req.body;
  if (!cartID) {
    throw new customError(400, "Cart item id is missing!");
  }
  // Build query - ensure we have either userid or guestId
  if (!userid && !guestId) {
    throw new customError(400, "User ID or Guest ID is required");
  }
  const query = userid ? { user: userid } : { guestId: guestId };
  const cart = await cartModel.findById({ _id: cartID });
  if (!cart) {
    throw new customError(404, "Cart not found");
  }
  if (cart.user == userid) {
    await cartModel.deleteOne({ _id: cartID });
    const io = getIo();
    io.to("123").emit("cart", {
      message: "Product deleted from cart successfully",
      cart: "getCart",
    });
    return apiResponse.senSuccess(res, 200, "Cart item deleted successfully");
  }
  if (cart.guestId == guestId) {
    await cartModel.deleteOne({ _id: cartID });
    const io = getIo();
    io.to("123").emit("cart", {
      message: "Product deleted from cart successfully",
      cart: "getCart",
    });
    return apiResponse.senSuccess(res, 200, "Cart item deleted successfully");
  }
});
