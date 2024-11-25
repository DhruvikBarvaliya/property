require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  mongo_uri: process.env.MONGO_URI,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  env: process.env.ENV,
  maxDistance: process.env.MAX_DISTANCE,
  minDistance: process.env.MIN_DISTANCE,
  convertApi: process.env.CONVERT_API,
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_ip: process.env.DB_IP,
};
