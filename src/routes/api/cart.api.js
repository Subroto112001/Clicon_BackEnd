const express = require("express");
const cartController = require("../../controller/cart.controller")
const _ = express.Router();


_.route("/add-to-cart").post(cartController.addToCart);
_.route("/decrement-cart").put(cartController.decreaseQuantity);
_.route("/increment-cart").put(cartController.increaseQuantity);
_.route("/delete-cart").delete(cartController.deleteCartItem);




module.exports = _;