const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");

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

router.post("/upload/cv", fileUploader.single("cv"), async (req, res, next) => {
  //req.file
  if (!req.file) {
    next(new Error("No file uploaded"));
    return;
  }

  //req.file.path is the url of the file in cloudinary
  res.json({ fileUrl: req.file.path });
});
module.exports = router;
