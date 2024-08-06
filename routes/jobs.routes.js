const express = require("express");
const router = express.Router();
const Job = require("../models/Job.model");

// Create Job
router.post("/create/:userId", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: "Job created successfully!", job });
  } catch (error) {
    console.log(error);
  }
});

// Get Job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job);
  } catch (error) {
    console.log(error);
  }
});

// Update Job
router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(job);
  } catch (error) {
    console.log(error);
  }
});

// Delete Job
router.delete("/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
