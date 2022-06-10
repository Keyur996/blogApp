"use strict";

const Post = require('./../models/post');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require("./../utils/errorResponse");
const _ = require('lodash');
const { getPureType } = require('../utils/utils');

exports.uploadFile = asyncHandler(async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}`;
    if(req.file) {
        req.body.imagePath = JSON.stringify(`${url}/images/${req.file.filename}`);
    }
    _.forEach(req.body || {}, (_value, key) => {
        req.body[key] = JSON.parse(_value);
    });
    next();
});

exports.createPost = (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: req.body.imagePath
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: "Post added successfully",
            post: createdPost
        });
    }).catch(err => next(err));
};

exports.updateOne = asyncHandler(async (req, res, next) => {
    const post = {
        title: req.body.title,
        content: req.body.content,
        imagePath: req.body.imagePath
    }
    const doc = await Post.findByIdAndUpdate(req.params.id, post, { new: true, runValidators: true });
    if (!doc) {
        return next(new ErrorResponse('No Document Found With this ID', 404));
    }
    return res.status(200).json({
        message: 'Post Updated !!',
        data: doc
    });
});

exports.getPost = asyncHandler(async (req, res, next) => {
    let query = Post.findById(req.params.id);
    if (query.popOptions) {
        query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
        return next(new ErrorResponse('No Document Found With this ID', 404));
    }
    return res.status(200).json({
        message: 'Post fetched Successfully !',
        data: doc
    });
});

exports.getPosts = (req, res, next) => {
    Post.find().then(documents => {
        res.status(200).json({
            message: "Posts fetched successfully!",
            posts: documents
        });
    }).catch(err => next(err));
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id }).then(result => {
        console.log(result);
        res.status(200).json({ message: "Post deleted!" });
    }).catch(err => next(err));
}