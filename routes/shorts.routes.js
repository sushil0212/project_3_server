const express = require("express");
const axios = require("axios");
const router = express.Router();
const Short = require("../models/Short.model");
const Job = require("../models/Job.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const D_ID_API_URL = process.env.D_ID_API_URL;
const D_ID_API_KEY = process.env.D_ID_API_KEY;

// Get Shorts or Fallback to Jobs with User details for Likes/Dislikes
router.get("/", async (req, res) => {
  try {
    const { searchTerm = "", role = "" } = req.query;

    // Find shorts that match the searchTerm (position) and role
    const shorts = await Short.find({
      position: { $regex: searchTerm, $options: "i" },
      role: { $regex: role, $options: "i" },
    })
      .populate("jobId")
      .populate("likes", "username") // Populate the username of users who liked the short
      .populate("dislikes", "username"); // Populate the username of users who disliked the short

    if (shorts.length) {
      return res.status(200).json(shorts);
    } else {
      // If no shorts, fallback to jobs with the same filtering
      const jobs = await Job.find({
        position: { $regex: searchTerm, $options: "i" },
        role: { $regex: role, $options: "i" },
      });
      return res
        .status(200)
        .json({ fallback: "Showing job descriptions", jobs });
    }
  } catch (error) {
    console.error(error);
    try {
      const jobs = await Job.find();
      return res
        .status(200)
        .json({ fallback: "Showing job descriptions", jobs });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving jobs." });
    }
  }
});

// Create Short with video URL
router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      position,
      salary,
      workingDays,
      role,
      quailification,
      experience,
      vacancies,
    } = req.body;
    let shortVideoUrl = "";

    const payload = {
      script: {
        type: "text",
        input: `${position}, available vacancies ${vacancies}, with the salary`,
      },
      presenter_id: "amy-Aq6OmGZnMt",
      driver_id: "Vcq0R4a8F0",
    };

    const response = await axios.post(`${D_ID_API_URL}/clips`, payload, {
      headers: {
        Authorization: `Basic ${D_ID_API_KEY}`,
      },
    });

    if (response) {
      const videoId = response.data.id;
      const getVideo = await axios.get(`${D_ID_API_URL}/clips/${videoId}`, {
        headers: {
          Authorization: `Basic ${D_ID_API_KEY}`,
        },
      });
      if (getVideo) {
        shortVideoUrl = getVideo.data.audio_url;
      }
    }

    const short = await Short.create({
      position,
      salary,
      workingDays,
      role,
      quailification,
      experience,
      vacancies,
      shortVideoUrl,
    });

    await User.findByIdAndUpdate(userId, { $push: { shorts: short._id } });
    res.status(201).json({ message: "Short created successfully!", short });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating short." });
  }
});

// Show detail page of comment sections
router.get("/shorts/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    const short = await Short.findById(shortId).populate("jobId");
    if (!short) return res.status(404).json({ message: "Short not found" });
    res.status(200).json(short);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving short details." });
  }
});

// Add Comment to Short and populate username
router.post("/comment/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { comment, userId } = req.body;

  try {
    const short = await Short.findById(shortId);
    if (!short) return res.status(404).json({ message: "Short not found" });

    const newComment = await Comment.create({ userId, text: comment });
    short.comments.push(newComment._id);
    await short.save();

    // Populate user information in the comment
    const populatedComment = await newComment.populate("userId", "username");

    res.status(201).json({
      message: "Comment added successfully!",
      comment: populatedComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment." });
  }
});

// Update Comment
router.put("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    await Comment.findByIdAndUpdate(commentId, { text: req.body.text });

    return res.status(200).json({ message: "Comment updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating comment." });
  }
});

// Delete Comment
router.delete("/comment/:shortId/:commentId", async (req, res) => {
  const { shortId, commentId } = req.params;

  try {
    const short = await Short.findById(shortId);
    if (!short)
      return res.status(400).json({ message: "Short or comment not found" });

    await Comment.findByIdAndDelete(commentId);
    await Short.findByIdAndUpdate(shortId, {
      $pull: { comments: commentId },
    });
    res.status(200).json({ message: "Comment deleted successfully!", short });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment." });
  }
});

// Get individual Short with comments and user info
router.get("/:shortId", async (req, res, next) => {
  const { shortId } = req.params;
  try {
    const foundShort = await Short.findById(shortId).populate({
      path: "comments",
      populate: { path: "userId", select: "username" },
    });

    if (!foundShort) {
      return res.status(404).json({ message: "Short not found" });
    }

    // Handle cases where userId might be null
    const cleanComments = foundShort.comments.map(comment => {
      return {
        _id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        username: comment.userId ? comment.userId.username : "Unknown User",
        userId: comment.userId ? comment.userId._id : null,
      };
    });

    const shortCopy = JSON.parse(JSON.stringify(foundShort));
    shortCopy.comments = cleanComments;

    res.status(200).json(shortCopy);
  } catch (error) {
    next(error);
  }
});

// Add Like to Short
router.post("/like/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { userId } = req.body;

  try {
    const short = await Short.findById(shortId);
    if (!short) return res.status(404).json({ message: "Short not found" });

    // Remove dislike if it exists
    if (short.dislikes.includes(userId)) {
      short.dislikes.pull(userId);
    }

    // Add like if it doesn't exist
    if (!short.likes.includes(userId)) {
      short.likes.push(userId);
      await short.save();
      const populatedShort = await Short.findById(shortId)
        .populate("likes", "username")
        .populate("dislikes", "username");
      return res.status(200).json({
        message: "Liked successfully!",
        short: populatedShort,
        likesCount: populatedShort.likes.length,
        dislikesCount: populatedShort.dislikes.length,
      });
    } else {
      return res.status(400).json({ message: "User already liked this short" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error liking short." });
  }
});

// Add Dislike to Short
router.post("/dislike/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { userId } = req.body;

  try {
    const short = await Short.findById(shortId);
    if (!short) return res.status(404).json({ message: "Short not found" });

    // Remove like if it exists
    if (short.likes.includes(userId)) {
      short.likes.pull(userId);
    }

    // Add dislike if it doesn't exist
    if (!short.dislikes.includes(userId)) {
      short.dislikes.push(userId);
      await short.save();
      const populatedShort = await Short.findById(shortId)
        .populate("likes", "username")
        .populate("dislikes", "username");
      return res.status(200).json({
        message: "Disliked successfully!",
        short: populatedShort,
        likesCount: populatedShort.likes.length,
        dislikesCount: populatedShort.dislikes.length,
      });
    } else {
      return res
        .status(400)
        .json({ message: "User already disliked this short" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error disliking short." });
  }
});

module.exports = router;
