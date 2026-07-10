const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "movie",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    adminReply: {
      text: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: null,
      },
      repliedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
