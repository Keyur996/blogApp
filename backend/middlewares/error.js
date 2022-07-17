"use strict";

const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");

module.exports = (err, req, res, next) => {
  // console.log(err);
  let error = { ...err };
  if (err.name === "CastError") {
    const message = `Resource not Found`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = _.map(err.errors, (_e) => _e.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: err.message || "Something Broke",
  });
};
