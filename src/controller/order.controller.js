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
const crypto = require("crypto");
const invoiceModel = require("../models/invoice.model");
const SSLCommerzPayment = require("sslcommerz-lts");

// ssl Commerze

const store_id=process.env.SSL_STOREID;
const store_passwd=process.env.SSL_STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true;

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

  let orderInstanse = null;
  try {
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

    // @desc now make transaction id
    const transactionId = `INV-${crypto
      .randomUUID()
      .split("-")[0]
      .toLocaleUpperCase()}`;

    // @desc generate invoice
    const invoice = await invoiceModel.create({
      invoiceId: transactionId,
      order: orderInstanse._id,
      customerDetails: shippingInfo,
      discountAmount: orderInstanse.discountAmount,
      finalAmount: orderInstanse.finalAmount,
      deliveryChargeAmount: charge,
    });

    // now handle payment action
    if (paymentMethod == "cod") {
      orderInstanse.paymentMethod = "cod";
      orderInstanse.paymentStatus = "Pending";
      orderInstanse.transactionId = transactionId;
      orderInstanse.orderStatus = "Pending";
      orderInstanse.invoiceId = invoice.invoiceId;
      orderInstanse.totalQuantity = cart.totalQuantity;
    } else {
      // here we work for sslcommerce
      const data = {
        total_amount: orderInstanse.finalAmount,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${process.env.BACKEND_URL}${process.env.BASE_URL}/payment/success`,
        fail_url: `${process.env.BACKEND_URL}${process.env.BASE_URL}/payment/fail`,
        cancel_url: `${process.env.BACKEND_URL}${process.env.BASE_URL}/payment/cancel`,
        ipn_url: `${process.env.BACKEND_URL}${process.env.BASE_URL}/payment/ipn`,
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: orderInstanse.shippingInfo.fullname,
        cus_email: orderInstanse.shippingInfo.email,
        cus_add1: orderInstanse.shippingInfo.address,
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        // cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_city: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const sslczResponse = await sslcz.init(data);
      console.log(sslczResponse.GatewayPageURL);
      
    }
  } catch (error) {
    console.log("Error From Order Controller makeorder", error);
    const stockReducePromise = [];

    for (let item of cart.items) {
      if (item.product) {
        stockReducePromise.push(
          productModel.findOneAndUpdate(
            { _id: item.product },
            { $inc: { stock: item.quantity, totalSale: -item.quantity } },
            { new: true }
          )
        );
      }
      if (item.variant) {
        stockReducePromise.push(
          variantModel.findOneAndUpdate(
            { _id: item.variant },
            {
              $inc: { stockVariant: item.quantity, totalSale: -item.quantity },
            },
            { new: true }
          )
        );
      }
    }
    await Promise.all(stockReducePromise);
  }
});
