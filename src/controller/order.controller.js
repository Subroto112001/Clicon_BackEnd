const { asyncHandeler } = require("../utils/asyncHandeler");
const { validateOrder } = require("../validation/order.validation");
const orderModel = require("../models/order.model");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const vaiantModel = require("../models/variant.model");
const variantModel = require("../models/variant.model");
const deliveryChargeModel = require("../models/deliveryCharge.model");

// apply deliveryCharge
const applyDeliveryCharge = async (dcid) => {
  const deliveryCharge = await deliveryChargeModel.findById({ _id: dcid });
  if (!deliveryCharge) {
    throw new customError(501, "Charge Not Found");
  }
  return deliveryCharge;
};

// @desc make a order
exports.makeAorder = asyncHandeler(async (req, res) => {
  const { user, guestId, shippingInfo, deliveryCharge, paymentMethod } =
    await validateOrder(req);

  const query = user ? { user: user } : { guestId: guestId };
  const cart = await cartModel
    .findOne(query)
    .populate("items.product")
    .populate("items.variant")
    .populate("coupon");

  if (!cart) {
    throw new customError(404, "Cart Not Found");
  }
  // decrease the stock

  /**
   * name: stockReducePromise
   * todo:stock Reduce
   * @desc : this array will hold every pending promise
   * */

  const stockReducePromise = [];

  for (let item of cart.items) {
    if (item.product) {
      stockReducePromise.push(
        productModel.findOneAndUpdate(
          { _id: item.product },
          { $inc: { stock: -item.quantity, totalSale: item.quantity } },
          { new: true }
        )
      );
    }
    if (item.variant) {
      stockReducePromise.push(
        variantModel.findOneAndUpdate(
          { _id: item.variant },
          { $inc: { stockVariant: -item.quantity, totalSale: item.quantity } },
          { new: true }
        )
      );
    }
  }

  let orderInstanse = null
  orderInstanse = new orderModel({
    user: user,
    guestId: guestId,
    items: cart.items,
    shippingInfo: shippingInfo,
    deliveryCharge: deliveryCharge,
    paymentMethod: paymentMethod,
  });
  
  const { name, charge } = await applyDeliveryCharge(deliveryCharge);

orderInstanse.finalAmount = Math.round(cart.finalAmount + charge);
orderInstanse.discountAmount = cart.discountAmount;
orderInstanse.shippingInfo.deliveryZone = name;



  // now handle payment action
  if (paymentMethod == "cod") {
    // here we work for cash on delivery
  } else {
    // here we work for sslcommerce
  }
});
