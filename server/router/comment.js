const express = require("express");
const {
  handleAddComment,
  handleGetComments,
  handleDeleteComment,
  handleAdminReply,
  handleDeleteAdminReply,
} = require("../controller/comment.controller");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { publicLimiter, apiLimiter } = require("../middleware/rateLimiter");
const { movieIdValidation, commentValidation } = require("../middleware/validators");
const { param, body } = require("express-validator");
const validate = require("../middleware/validate");

const commentRouter = express.Router({ mergeParams: true });

const commentIdValidation = [
  param("commentId").isMongoId().withMessage("Invalid comment ID."),
];

const replyValidation = [
  body("reply")
    .trim()
    .notEmpty().withMessage("Reply text is required.")
    .isLength({ min: 1, max: 1000 }).withMessage("Reply must be 1–1000 characters.")
    .escape(),
];

// GET  /api/movie/:id/comments
commentRouter.get(
  "/",
  publicLimiter,
  movieIdValidation,
  validate,
  handleGetComments
);

// POST /api/movie/:id/comments
commentRouter.post(
  "/",
  apiLimiter,
  movieIdValidation,
  commentValidation,
  validate,
  handleAddComment
);

// DELETE /api/movie/:id/comments/:commentId  — admin only
commentRouter.delete(
  "/:commentId",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  [...movieIdValidation, ...commentIdValidation],
  validate,
  handleDeleteComment
);

// PATCH /api/movie/:id/comments/:commentId/reply  — admin only
commentRouter.patch(
  "/:commentId/reply",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  [...movieIdValidation, ...commentIdValidation, ...replyValidation],
  validate,
  handleAdminReply
);

// DELETE /api/movie/:id/comments/:commentId/reply  — admin only (remove reply)
commentRouter.delete(
  "/:commentId/reply",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  [...movieIdValidation, ...commentIdValidation],
  validate,
  handleDeleteAdminReply
);

module.exports = commentRouter;
