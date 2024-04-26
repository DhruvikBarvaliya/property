const { port, env } = require("./Config/Config");
const express = require("express");
const app = express();
const cors = require("cors");
const indexRouter = require("./Routers/index");
const database = require("./Config/Database");

// Initialize database connection
database();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
