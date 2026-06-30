const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({}); // Use disk storage for large videos
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow any file for now to prevent strict mime type errors on videos
    cb(null, true);
  }
});

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'ajwahub',
      chunk_size: 6000000 // 6MB chunks for stable large video uploads
    });
    res.json({ message: 'Uploaded', path: result.secure_url });
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
