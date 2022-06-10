'use strict';

const mongoose = require('mongoose');
module.exports = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/blogApp", { useUnifiedTopology: true, useNewUrlParser: true });
    } catch(err) {
        console.log("Connection failed!");
    }
}