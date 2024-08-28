// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity.model");
const Notification = require("../models/Notification.model");
const Short = require("../models/Short.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/data", isAuthenticated, async (req, res) => {
  console.log(req.payload);
  try {
    // Fetch user count
    const userCount = await User.countDocuments();

    // Fetch CV uploads count (assuming type 'cv_upload' represents CV uploads)
    // Fetch like count (sum of all likes on shorts)
    const cvUploadCount = await Notification.countDocuments({
      type: "cv_uploaded",
      recipient: req.payload._id,
    });

    const likeCount = await Short.aggregate([
      { $unwind: "$likes" },
      { $count: "likeCount" },
    ]);

    // Fetch dislike count (sum of all dislikes on shorts)
    const dislikeCount = await Short.aggregate([
      { $unwind: "$dislikes" },
      { $count: "dislikeCount" },
    ]);

    // Fetch comment count (sum of all comments on shorts)
    const commentCount = await Short.aggregate([
      { $unwind: "$comments" },
      { $count: "commentCount" },
    ]);

    // Fetch user activities breakdown
    const userActivities = await Activity.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      userCount,
      cvUploadCount,
      likeCount: likeCount[0]?.likeCount || 0, // Handle empty aggregation result
      dislikeCount: dislikeCount[0]?.dislikeCount || 0, // Handle empty aggregation result
      commentCount: commentCount[0]?.commentCount || 0, // Handle empty aggregation result
      userActivities,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
