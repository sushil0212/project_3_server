
const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Short = require("../models/Short.model");

// Save a short to user's saved list
router.post("/save/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedShorts.includes(shortId)) {
      user.savedShorts.push(shortId);
      await user.save();
      return res.status(200).json({ message: "Short saved successfully" });
    } else {
      return res.status(400).json({ message: "Short already saved" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving short." });
  }
});

// Remove a short from user's saved list
router.delete("/remove/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedShorts.pull(shortId);
    await user.save();
    return res.status(200).json({ message: "Short removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing short." });
  }
});

// Get all saved shorts for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("savedShorts");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.savedShorts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving saved shorts." });
  }
});

module.exports = router;
