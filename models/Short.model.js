// models/Short.model.js
const { Schema, model } = require("mongoose");

const shortSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job" },
  shortVideoUrl: { type: String },
  description: { type: String },
  position: { type: String },
  salary: { type: String },
  role: { type: String },
  qualification: { type: String },
  experience: { type: String },
  workingDays: { type: String },
  vacancies: { type: Number },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
});

const Short = model("Short", shortSchema);
module.exports = Short;
