require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  mongo_uri: process.env.MONGO_URI,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  user: process.env.USER,
  password: process.env.PASSWORD,
  env: process.env.ENV,
  maxDistance: process.env.MAX_DISTANCE,
  minDistance: process.env.MIN_DISTANCE,
};
