const { jwt_secret_key } = require("../Config/Config");
const jwt = require("jsonwebtoken");

function authorize(roles = []) {
  try {
    if (typeof roles === "string") {
      roles = [roles];
    }
    return [
      (req, res, next) => {
        var token;
        try {
          try {
            token = req.headers.authorization.split(" ")[1];
          } catch (err) {
            return res.status(401).json({
              status: 401,
              code: "E_UNAUTHORIZED",
              data: null,
              message: "Jwt token is missing in request",
            });
          }

          decodedToken = jwt.verify(token, jwt_secret_key);
          const { role } = decodedToken;
          if (roles.length && !roles.includes(role)) {
            return res.status(401).json({
              status: 401,
              code: "E_PERMISSION_DENIED",
              data: null,
              message: "Permission denied",
            });
          }
          next();
        } catch (err) {
          return res.status(200).json({
            status: 699,
            code: "E_TOKEN_EXPIRED",
            message: "JWT Token is expired or invalid",
          });
        }
      },
    ];
  } catch (err) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Server Error",
        error: err.message || err.toString(),
      });
  }
}
module.exports = authorize;
