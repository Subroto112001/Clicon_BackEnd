const { customError } = require("../utils/customError");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.model");
require("../models/permission.model");
exports.authGurd = async (req, _, next) => {
  const token =
    req.headers.authorization.replace("Bearer ", "") || req.body.token;
  const refressToken = req?.body?.cookie?.replace("refressToken=", "") || null;
  if (token) {
    const decodedToken = jwt.verify(token, process.env.ACCESTOKEN_SECRET);

    if (!decodedToken) {
      throw new customError(401, "token invalid");
    }
    const findUser = await UserModel.findById(decodedToken.userid)
      .populate("permission.permissionId")
      .populate("role")
      .select("-password");
    console.log(findUser);

    if (!findUser) {
      throw new customError(401, "User not found");
    }

    req.user = findUser;
    next();
  } else {
    throw new customError(401, "Token not found");
  }
};
