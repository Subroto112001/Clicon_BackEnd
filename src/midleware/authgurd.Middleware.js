const { customError } = require("../utils/customError")
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.model")
exports.authGurd = async(req, _, next) => {
  const token = req.headers.authorization || req.body.token;
    if (token) {
        const decodedToken = jwt.verify(token, process.env.ACCESTOKEN_SECRET);
        
        if (!decodedToken) {
            throw new customError(401, "token invalid")
        }
        const findUser = await UserModel.findById(decodedToken.userid);
        
        if (!findUser) {
            throw new customError(401, "User not found")
        } else {
            let obj = {}
            obj.id = findUser._id;
            obj.email = findUser.email
            req.user = obj;
            next();
        }


        
    } else {
        throw new customError(401, "Token not found")
    }
}