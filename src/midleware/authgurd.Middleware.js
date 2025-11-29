const { customError } = require("../utils/customError");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
require("../models/permission.model");

exports.authGurd = async (req, res, next) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.body.token;

  if (!token) {
    throw new customError(401, "Token not found");
  }
  if (token) {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESTOKEN_SECRET.trim()
    );

    if (!decodedToken) {
      throw new customError(401, "Token invalid");
    }

    const findUser = await UserModel.findById(decodedToken.userid)
      .populate("permission.permissionId")
      .populate("role")
      .select("-password");

    if (!findUser) {
      throw new customError(401, "User not found");
    }

    req.user = findUser;
    next();
  } else {
    throw new customError(401, "Token Not Found");
  }
};
