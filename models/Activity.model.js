// models/Activity.model.js
const { Schema, model } = require("mongoose");

const activitySchema = new Schema({
  type: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  shortId: { type: Schema.Types.ObjectId, ref: "Short" },

  
  timestamp: { type: Date, default: Date.now }, // When the activity occurred
});

const Activity = model("Activity", activitySchema);

module.exports = Activity;
