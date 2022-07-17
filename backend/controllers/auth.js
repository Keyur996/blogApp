"use strict";

const User = require("./../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  return res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

exports.signUp = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.create({ email, password });

  createSendToken(user, 201, req, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide Email And Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new ErrorResponse("Invalid email or Password !!", 401));
  }

  createSendToken(user, 200, req, res);
});
