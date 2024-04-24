const { UnauthenticatedError, UnauthorizedError } = require("../errors");
const { verifyJWT } = require("../utils/jwt");

exports.authenticateUser = function (req, res, next) {
  try {
    const { token } = req.signedCookies;
    const { name, userId, role } = verifyJWT(token);
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid!");
  }
};

exports.authorizePermissions = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};
