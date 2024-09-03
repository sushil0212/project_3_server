/* // routes/notifications.routes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");


// Get notifications for the logged-in user or company
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.payload._id,
    })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.post("/:notificationId/read", isAuthenticated, async (req, res) => {
  try {
    const test = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      {
        isRead: true,
      },
      { new: true }
    );
    console.log(test);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Failed to mark notification as read", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Endpoint for companies to send messages to users
router.post("/:notificationId/message", isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { message } = req.body;
    console.log(notificationId);
    const notification = await Notification.findById(notificationId).populate(
      "sender"
    );
    console.log(notification);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Send a message notification to the user who uploaded the CV
    await Notification.create({
      recipient: notification.sender._id,
      type: "cv_review",
      message:
        message || "Your CV has been reviewed. We will contact you soon.",
    });

    res.status(200).json({ message: "Message sent to the user successfully." });
  } catch (error) {
    console.error("Failed to send message", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
 */

const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");

// Get notifications for the logged-in user or company
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.payload._id,
    })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.post("/:notificationId/read", isAuthenticated, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Failed to mark notification as read", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Endpoint for companies to send messages to users
router.post("/:notificationId/message", isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { message } = req.body;

    const notification = await Notification.findById(notificationId).populate(
      "sender recipient"
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if the company sending the message is the intended recipient of the CV
    if (req.payload._id !== notification.recipient._id.toString()) {
      return res
        .status(403)
        .json({
          message:
            "You are not authorized to send a message for this notification",
        });
    }

    // Send a message notification to the user who uploaded the CV
    await Notification.create({
      recipient: notification.sender._id,
      sender: req.payload._id, // The company sending the message
      type: "cv_review",
      message:
        message || "Your CV has been reviewed. We will contact you soon.",
    });

    res.status(200).json({ message: "Message sent to the user successfully." });
  } catch (error) {
    console.error("Failed to send message", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
