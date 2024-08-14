// auth.routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const router = express.Router();
const fs = require("fs"); // For file system operations
const path = require("path");

const saltRounds = 10;

// POST - Signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password, profilePic } = req.body;
    if (username === "" || email === "" || password === "") {
      res
        .status(400)
        .json({ message: "Please provide username, email and password" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please provide a valid email address" });
      return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Your password needs to contain at least a number, a lowercase letter, an uppercase letter and have at least 6 characters",
      });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePic: profilePic ? profilePic : "",
    });

    const cleanUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
    };
    res.status(201).json(cleanUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST - Login
router.post("/login", async (req, res, next) => {
  try {
    const { password, email } = req.body;
    if (email === "" || password === "") {
      res.status(400).json({ message: "Provide email and password" });
      return;
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      res.status(400).json({ message: "Email not found" });
      return;
    }

    const passwordCorrect = bcrypt.compareSync(password, userExists.password);
    if (!passwordCorrect) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const { _id, username, companyInfo } = userExists;
    const payload = {
      _id: userExists._id,
      username: userExists.username,
      email,
      profilePic: userExists.profilePic,
      companyInfo: userExists.companyInfo,
    };
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "50d",
    });
    res.status(200).json({ authToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET - Verify
router.get("/verify", isAuthenticated, async (req, res, next) => {
  res.status(200).json(req.payload);
});

// POST - Update Profile Picture
router.post("/update-profile-pic", isAuthenticated, async (req, res, next) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      res.status(400).json({ message: "No profile picture URL provided" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { profilePic },
      { new: true }
    );

    const payload = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      companyInfo: updatedUser.companyInfo,
    };
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "50d",
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      authToken: authToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST - Delete Profile Picture
router.post("/delete-profile-pic", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    /* const user = await User.findById(req.body.userId);*/
    /* const { profilePic } = req.body; */

    /*     if (!profilePic) {
      res.status(404).json({ message: "User not found" });
      return;
    } */

    // Find the user and update their profile picture field to an empty string
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: "" }, // Clear the profile picture
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a new token with the updated user data
    const payload = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      companyInfo: updatedUser.companyInfo,
    };
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "50d",
    });

    res.status(200).json({ authToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
