// backend/routes/shorts.routes.js
const express = require("express");
const router = express.Router();
const Short = require("../models/Short.model");
const Job = require("../models/Job.model");
const User = require("../models/User.model");
const axios = require("axios");

const D_ID_API_URL = process.env.D_ID_API_URL;
const D_ID_API_KEY = process.env.D_ID_API_KEY;

// Create Short
router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const short = await Short.create(req.body);
    await User.findByIdAndUpdate(userId, { $push: { shorts: short._id } });
    res.status(201).json({ message: "Short created successfully!", short });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating short." });
  }
});

// Get Shorts or Fallback to Jobs
router.get("/", async (req, res) => {
  try {
    const shorts = await Short.find().populate("jobId");
    if (shorts.length) {
      return res.status(200).json(shorts);
    } else {
      const jobs = await Job.find();
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

// Generate Video
router.post("/generate-video/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { description } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const payload = { text: description || job.description };

    const response = await axios.post(D_ID_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${D_ID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const short = await Short.create({
        jobId: job._id,
        description: description || job.description,
        shortVideoUrl: response.data.videoUrl,
      });
      return res.status(200).json({
        message: "Video generated and short created successfully!",
        videoUrl: response.data.videoUrl,
        short,
      });
    } else {
      return res.status(500).json({
        message: "D-ID API call failed. Here are the job details.",
        jobDescription: job.description,
      });
    }
  } catch (error) {
    console.error(error);
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(500).json({
      message: "An error occurred with D-ID API. Here are the job details.",
      jobDescription: job.description,
    });
  }
});

// Add Comment to Short
router.post("/comment/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { comment } = req.body;

  try {
    const short = await Short.findById(shortId);
    if (!short) return res.status(404).json({ message: "Short not found" });

    short.comments = short.comments || [];
    short.comments.push(comment);
    await short.save();

    res.status(201).json({ message: "Comment added successfully!", short });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment." });
  }
});

// Get Comments for Short
router.get("/comments/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const short = await Short.findById(shortId).populate("comments");
    if (!short) return res.status(404).json({ message: "Short not found" });

    res.status(200).json(short.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving comments." });
  }
});

module.exports = router;
