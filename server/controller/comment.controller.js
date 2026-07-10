const Comment = require("../models/comment");
const Movies = require("../models/movie");

// POST /api/movie/:id/comments  — add a comment
const handleAddComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, comment } = req.body;

    // Verify movie exists
    const movie = await Movies.findById(id).lean();
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const newComment = await Comment.create({ movie: id, name, comment });

    return res.status(201).json({
      success: true,
      message: "Comment posted successfully.",
      data: newComment,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movie/:id/comments  — get comments for a movie (paginated)
const handleGetComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ movie: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ movie: id }),
    ]);

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/movie/:id/comments/:commentId  — admin only
const handleDeleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const deleted = await Comment.findByIdAndDelete(commentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    return res.status(200).json({ success: true, message: "Comment deleted." });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/movie/:id/comments/:commentId/reply  — admin only
const handleAdminReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { reply } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    comment.adminReply = {
      text: reply.trim(),
      repliedAt: new Date(),
    };
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Reply posted successfully.",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/movie/:id/comments/:commentId/reply  — admin only (remove reply)
const handleDeleteAdminReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    comment.adminReply = { text: null, repliedAt: null };
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Reply removed.",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleAddComment, handleGetComments, handleDeleteComment, handleAdminReply, handleDeleteAdminReply };
