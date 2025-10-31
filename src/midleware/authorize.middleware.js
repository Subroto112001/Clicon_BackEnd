const { customError } = require("../utils/customError");

const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      console.log(req.user.permission);
    } catch (error) {
      throw new customError(403, "You are not allowed to access this resource");
    }
  };
};

module.exports = { authorize };
