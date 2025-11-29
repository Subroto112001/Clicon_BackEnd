
const { customError } = require("../utils/customError");

const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
     
    
      const findPermission = req.user.permission.find(
        (permission) =>
          permission.permissionId?.name === resource &&
          permission.actions.includes(action)
      );
      if (!findPermission) {
        throw new customError(
          401,
          "You are not allowed to access this resource")
      };
      console.log(findPermission);
      req.permission = findPermission;
      next();
    } catch (error) {
      throw new customError(
        401,
        "You are not allowed to access this resource",
        error
      );
    } 
  }
}
 
module.exports = { authorize }; 