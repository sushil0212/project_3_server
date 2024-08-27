const express = require("express");
const router = express.Router();
const Job = require("../models/Job.model");
const User = require("../models/User.model");

const Activity = require("../models/Activity.model");

// Create Job
router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      industry,
      businessName,
      mobileNo,
      email,
      companyWebsite,
      details,
      contact,
      address,
      description,
    } = req.body;

    if (!industry || !businessName || !mobileNo || !email || !companyWebsite) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    // Create a new job
    const job = await Job.create({
      industry,
      businessName,
      mobileNo,
      email,
      companyWebsite,
      details,
      contact,
      address,
      description,
    });

    // Update user with the new job's ID
    await User.findByIdAndUpdate(userId, { companyInfo: job._id });

    // Track the job creation activity
    await Activity.create({
      type: "job_creation",
      userId,
    });

    res.status(201).json({ message: "Job created successfully!", job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating job." });
  }
});

// Get Job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving job." });
  }
});

// Update Job
router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating job." });
  }
});

// Delete Job
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting job." });
  }
});

//Add activity logging

module.exports = router;
