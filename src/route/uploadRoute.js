import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

// Upload image to S3 (LocalStack) and return the S3 URL
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // multer-s3 sets req.file.location to the full S3 URL
    // e.g. http://localhost:4566/news-images/images/1234567890-photo.jpg
    const url = req.file.location;

    res.status(200).json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Image upload failed", error: err });
  }
});

export default router;
