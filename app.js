const { port, env } = require("./Config/Config");
const express = require("express");
const app = express();
const cors = require("cors");
const indexRouter = require("./Routers/index");
const database = require("./Config/Database");

// Initialize database connection
database();

// Middleware setup
app.use(
  cors({
    origin: "*", // or specify the allowed origin(s)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
// Manually set CORS headers for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all domains
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow specific methods
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
  next(); // Pass control to the next middleware
});
// Root route
app.get("/", (req, res) => {
  res.send(`Welcome To Property Portal, Currently You are in ${env} Mode`);
});

// API routes
app.use("/api", indexRouter);

// Not found error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = env === "development" ? err : {};

  res
    .status(err.status || 500)
    .json({ status: false, message: "Page Not Found", err });
});

// Server initialization
app.listen(port, () => {
  console.log(
    `Server is Running on ${
      env === "development"
        ? `http://localhost:${port}`
        : "https://property-gtp6.onrender.com/"
    }`
  );
});
