//comment.model.js
const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);
module.exports = Comment;
