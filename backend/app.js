"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const dotEnv = require("dotenv");
const cookeParser = require("cookie-parser");
// Global Error Handler
const errorHandler = require("./middlewares/error");
const ErrorResponse = require("./utils/errorResponse");

// config storage
dotEnv.config({
  path: path.join(process.cwd(), "./backend/config/config.env"),
});
// app
const app = express();

require("./utils/dbConnect")()
  .then(() => {
    console.log("database Connected Successfully !!");
  })
  .catch((err) => next(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Log Request.
app.use(require("morgan")("dev"));
// cookie Parser.
app.use(cookeParser());
// expose static images file
app.use("/images", express.static(path.join("backend/images")));

app.use(cors());

app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));

app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Route not Found ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
