const { jwt_secret_key } = require("../Config/Config");
const jwt = require("jsonwebtoken");

function authorize(roles = []) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        code: "E_UNAUTHORIZED",
        message: "Jwt token is missing in request",
      });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, jwt_secret_key);
      const { role } = decodedToken;

      if (roles.length && !roles.includes(role)) {
        return res.status(401).json({
          status: 401,
          code: "E_PERMISSION_DENIED",
          message: "Permission denied",
        });
      }
      next();
    } catch (err) {
      return res.status(401).json({
        status: 401,
        code: "E_TOKEN_EXPIRED",
        message: "JWT Token is expired or invalid",
      });
    }
  };
}

module.exports = authorize;
