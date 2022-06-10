"use strict";

const getPureType = (_value) => {
  return Object.prototype.toString.call(_value).slice(8, -1);
};

module.exports = {
  getPureType,
};
