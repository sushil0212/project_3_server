//const express = require('express)
//const router = express.Router()

const express = require("express");
const router = express.Router();
const Short = require("../models/Short.model");

// Create Short
router.post("/create/:userId", async (req, res) => {
  try {
    const short = new Short(req.body);
    await short.save();
    res.status(201).json({ message: "Short created successfully!", short });
  } catch (error) {
    console.log(error);
  }
});

// Get Shorts
router.get("/", async (req, res) => {
  try {
    const shorts = await Short.find().populate("jobId");
    res.status(200).json(shorts);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
