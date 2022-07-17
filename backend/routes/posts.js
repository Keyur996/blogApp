"use strict";

const express = require("express");
const { uploader } = require("../middlewares/fileUploader");
const postController = require("./../controllers/post");

const router = express.Router();

router
  .route("")
  .get(postController.getPosts)
  .post(
    uploader.single("image"),
    postController.uploadFile,
    postController.createPost
  );

router
  .route("/:id")
  .get(postController.getPost)
  .patch(
    uploader.single("image"),
    postController.uploadFile,
    postController.updateOne
  )
  .delete(postController.deletePost);

module.exports = router;
