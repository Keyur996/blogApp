
(() => {
  "use strict";

  const ErrorResponse = require("../utils/errorResponse");
  const User = require("./../models/user");
  const jwt = require("jsonwebtoken");
  const _ = require("lodash");

  module.exports = async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.id);
      req.user = _.cloneDeep(user);
      next();
    } catch(err) {
      console.log("Error", err);
      return next(new ErrorResponse("Need Pass Auth Token", 401))
    }
  }
})()