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
const { orderConfirmation } = require("../TemplateEmail/Template");
const { smsSender, mailSender } = require("../helpers/helper");

// ssl Commerze

const store_id = process.env.SSL_STOREID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
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

    // @desc now make transaction id
    const transactionId = `INV-${crypto
      .randomUUID()
      .split("-")[0]
      .toLocaleUpperCase()}`;

    orderInstanse.items = cart.items.map((item) => {
      const plainItem = item.toObject();
      if (plainItem.product && typeof plainItem.product == "object") {
        plainItem.product = {
          _id: plainItem.product._id,
          name: plainItem.product.name,
          price: plainItem.product.retailPrice,
          image: plainItem.product.image,
          totalSale: plainItem.product.totalSale,
        };
      }

      if (plainItem.variant && typeof plainItem.variant == "object") {
        plainItem.variant = {
          _id: plainItem.variant._id,
          name: plainItem.variant.name,
          price: plainItem.variant.retailPrice,
          image: plainItem.variant.image,
          totalSale: plainItem.variant.totalSale,
        };
      }
      return plainItem;
    });

    orderInstanse.finalAmount = Math.round(cart.finalAmount + charge);
    orderInstanse.discountAmount = cart.discountAmount;
    orderInstanse.shippingInfo.deliveryZone = name;
    orderInstanse.totalQuantity = cart.totalQuantity;

    // @desc generate invoice
    const invoice = await invoiceModel.create({
      invoiceId: transactionId,
      order: orderInstanse._id,
      customerDetails: shippingInfo,
      discountAmount: orderInstanse.discountAmount,
      finalAmount: orderInstanse.finalAmount,
      deliveryChargeAmount: charge,
    });

    orderInstanse.invoiceId = invoice.invoiceId;
    orderInstanse.transactionId = transactionId;

    // now handle payment action
    // For COD payment (around line 168 in your code)
    if (paymentMethod == "cod") {
      orderInstanse.paymentMethod = "cod";
      orderInstanse.paymentStatus = "Pending";
      orderInstanse.orderStatus = "Pending";

      // Save the order first
      await orderInstanse.save();

      if (shippingInfo.email) {
        const emailTemplate = orderConfirmation({
          items: orderInstanse.items,
          shippingInfo: orderInstanse.shippingInfo,
          invoiceId: orderInstanse.invoiceId,
          deliveryCharge: charge,
          totalQuantity: orderInstanse.totalQuantity,
          finalAmount: orderInstanse.finalAmount,
          discountAmount: orderInstanse.discountAmount,
        });
        sendEmail(shippingInfo.email, emailTemplate, "Order Confirm");
      }

      if (shippingInfo.phone) {
        const smsRes = await smsSender(shippingInfo.phone, "Order Confirm");
        console.log(smsRes);
      }
    } else {
      // For online payment (sslcommerze)
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
        cus_name: orderInstanse.shippingInfo.fullname,
        cus_email: orderInstanse.shippingInfo.email,
        cus_add1: orderInstanse.shippingInfo.address,
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: orderInstanse.shippingInfo.phone,
        ship_name: orderInstanse.shippingInfo.fullname,
        ship_add1: orderInstanse.shippingInfo.address,
        ship_city: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const sslczResponse = await sslcz.init(data);
      if (!sslczResponse) {
        throw new customError(501, "Payment Failed");
      }

      orderInstanse.paymentMethod = "sslcommerze";
      orderInstanse.paymentStatus = "Pending";
      orderInstanse.orderStatus = "Pending";
      orderInstanse.paymentGatewayData = sslczResponse;

      // Save the order first
      await orderInstanse.save();

      if (shippingInfo.email) {
        const emailTemplate = orderConfirmation({
          items: orderInstanse.items,
          shippingInfo: orderInstanse.shippingInfo,
          invoiceId: orderInstanse.invoiceId,
          deliveryCharge: charge,
          totalQuantity: orderInstanse.totalQuantity,
          finalAmount: orderInstanse.finalAmount,
          discountAmount: orderInstanse.discountAmount,
        });
        sendEmail(shippingInfo.email, emailTemplate, "Order Confirmation");
      }

      if (shippingInfo.phone) {
        const smsRes = await smsSender(shippingInfo.phone, "Order Confirm");
        console.log(smsRes);
      }

      return apiResponse.senSuccess(
        res,
        200,
        "EasyCheckOut Payment Url",
        sslczResponse.GatewayPageURL
      );
    }

    // For COD - send response after saving
    await orderInstanse.save();
    apiResponse.senSuccess(
      res,
      200,
      "Order Placed Successfully",
      orderInstanse
    );
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

const sendEmail = async (email, orderConfirmation, msg) => {
  const emailInfo = await mailSender(email, orderConfirmation, msg);
  console.log(emailInfo);
};

// @desc get all order

exports.getAllOrders = asyncHandeler(async (req, res) => {
  const orders = await orderModel
    .find()
    .populate("deliveryCharge items.product items.variant")
    .sort({ createdAt: -1 });

  if (!orders.length) {
    throw new customError(404, "Order not found");
  }

  console.log(orders);

  apiResponse.senSuccess(res, 200, "All Order", orders);
});

// @desc get single order
exports.getSingleOrders = asyncHandeler(async (req, res) => {
  const orders = await orderModel
    .find()
    .populate("deliveryCharge items.product items.variant")
    .sort({ createdAt: -1 });

  if (!orders.length) {
    throw new customError(404, "Order not found");
  }
});

// @desc update order info
exports.updateOrderInfo = asyncHandeler(async (req, res) => {
  const { id, status, shippingInfo } = req.body;
const allStatus = [
  "Pending",
  "Hold",
  "Confirmed",
  "Packaging",
  "CourierPending",
];
  const updateInfo = await orderModel.findOneAndUpdate(
    { _id: id },
    {
      orderStatus: allStatus.includes(status) && status,

      shippingInfo: { ...shippingInfo },
    },
    { new: true }
  );
  if (!updateInfo) {
    throw new customError(404, "Order not found");
  }
  apiResponse.senSuccess(
    res,
    200,
    "Order Updated Successfully",
    {
      orderStatus: updateInfo.orderStatus
    }
  );
});
