// index.routes.js
const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Notification = require("../models/Notification.model");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.post(
  "/upload/image",
  fileUploader.single("imgUrl"),
  async (req, res, next) => {
    //req.file
    if (!req.file) {
      next(new Error("No file uploaded"));
      return;
    }

    //req.file.path is the url of the file in cloudinary
    res.json({ fileUrl: req.file.path });
  }
);

router.post(
  "/upload/cv/:shortId",
  fileUploader.single("cv"),
  isAuthenticated,
  async (req, res, next) => {
    try {
      const userId = req.payload._id;
      const shortId = req.params.shortId;

      const user = await User.findById(userId).populate("companyInfo");
      const company = await User.findOne({
        shorts: {
          $in: shortId,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is a company
      if (user.companyInfo) {
        return res.status(403).json({ message: "Companies cannot upload CVs" });
      }

      // Save CV URL to the user's profile
      user.cvUrl = req.file.path;
      await user.save();

      // Create a notification for the company if the companyInfo is present
      if (company) {
        await Notification.create({
          recipient: company._id,
          type: "cv_uploaded",
          message: `${user.username} has uploaded a new CV.`,
          cvId: req.file.path, // URL notification
          sender: userId, // Tracking the CV
        });
      }

      // Notify the user of successful CV upload
      await Notification.create({
        recipient: user._id,
        type: "cv_uploaded",
        message: "Your CV has been uploaded successfully.",
      });

      res.json({ fileUrl: req.file.path, message: "CV uploaded successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error while uploading CV" });
    }
  }
);

module.exports = router;
