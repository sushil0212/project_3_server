// backend/routes/generateVideo.routes.js
const express = require("express");
const router = express.Router();
const Short = require("../models/Short.model");
const Job = require("../models/Job.model");
const axios = require("axios");

const D_ID_API_URL = process.env.D_ID_API_URL;
const D_ID_API_KEY = process.env.D_ID_API_KEY;

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
        message: "D-ID API call failed.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred with D-ID API.",
    });
  }
});

module.exports = router;
