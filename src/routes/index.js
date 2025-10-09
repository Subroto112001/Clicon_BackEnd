const express = require("express");
const _ = express.Router();

_.use("/auth", require("./api/user.api"));
_.use("/category", require("./api/category.api"));
_.use("/subcategory", require("./api/subcategory.api"));
_.use("/brand", require("./api/brand.api"));
_.use("/discount", require("./api/discount.api"));
_.use("/product", require("./api/product.api"));
_.use("/variant", require("./api/variant.api"));
_.use("/customer-review", require("./api/customerReview.api"));
_.use("/cupon", require("./api/cupon.api"));
_.use("/cart", require("./api/cart.api"));
_.use("/deliveryCharge", require("./api/deliveryCharge.api"))
_.use("/order", require("./api/order.api"))
_.use("/payment", require("./api/payment.api"));
module.exports = _;
