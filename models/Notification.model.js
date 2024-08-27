const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who receives the notification
    sender: { type: Schema.Types.ObjectId, ref: "User" }, // User who triggers the notification (for comments or CV uploads)
    type: { type: String, required: true }, // Type of notification (e.g., 'cv_uploaded', 'cv_review', 'comment')
    message: { type: String, required: true }, // Notification message
    isRead: { type: Boolean, default: false }, // Whether the notification has been read
    cvId: { type: String }, // URL or reference to the CV
  },
  {
    timestamps: true,
  }
);

const Notification = model("Notification", notificationSchema);

module.exports = Notification;
