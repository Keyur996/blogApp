"use strict";

const express = require("express");
const { uploader } = require("../middlewares/fileUploader");
const postController = require("./../controllers/post");
const checkAuth = require("./../middlewares/checkAuth");

const router = express.Router();

router
  .route("")
  .get(postController.getPosts)
  .post(
    checkAuth,
    uploader.single("image"),
    postController.uploadFile,
    postController.createPost
  );

router
  .route("/:id")
  .get(checkAuth, postController.getPost)
  .patch(
    checkAuth,
    uploader.single("image"),
    postController.uploadFile,
    postController.updateOne
  )
  .delete(checkAuth, postController.deletePost);

module.exports = router;
