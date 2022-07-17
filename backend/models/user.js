"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide email"],
      validate: [validator.default.isEmail, "Please enter valid Email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minLength: [8, "Password must be atleast 8 digits long."],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
