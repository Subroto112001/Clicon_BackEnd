const { customError } = require("../utils/customError");

const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      
      await req.user.populate("permission.permissionId");

      const hasPermission = req.user.permission.find((p) => {
        return p.permissionId?.name === resource && p.actions.includes(action);
      });

      if (!hasPermission) {
        throw new customError(
          403,
          "You are not allowed to access this resource"
        );
      }

      next(); // ✅ Pass forward if allowed
    } catch (error) {
      next(new customError(403, "You are not allowed to access this resource"));
    }
  };
};

module.exports = { authorize };
