const { Schema, model } = require("mongoose");

const shortSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job" },
  shortVideoUrl: { type: String, required: true },
  description: { type: String },
});

const Short = model("Short", shortSchema);
module.exports = Short;
