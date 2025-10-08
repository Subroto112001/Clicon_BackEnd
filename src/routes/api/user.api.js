const express = require("express");
const _ = express.Router();
const authController = require("../../controller/user.controller");
const { authGurd } = require("../../midleware/authgurd.Middleware");


_.route("/registartion").post(authController.registration);
_.route("/login").post(authController.Login);
_.route("/verify-contact").post(authController.VerificationUserContact);
_.route("/forgot-password").post(authController.forgotPassword)
_.route("/reset-password").post(authController.resetPassword)
_.route("/logout").post(authGurd, authController.logout);
_.route("/get-me").get(authGurd, authController.getme);
_.route("/get-refreshtoken").post(authController.getrefreshtoken)
module.exports = _;
