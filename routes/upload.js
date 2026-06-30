const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({}); // Use disk storage for large videos
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
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
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not connected");

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    
    // Create an upload stream to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    
    fs.createReadStream(req.file.path)
      .pipe(uploadStream)
      .on('error', (error) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error saving to MongoDB', error: error.message });
      })
      .on('finish', () => {
        fs.unlinkSync(req.file.path);
        
        const host = req.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const fileUrl = `${protocol}://${host}/api/upload/file/${uploadStream.id}`;
        
        res.json({ message: 'Uploaded to MongoDB', path: fileUrl });
      });
  } catch (err) {
    console.error('MongoDB Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Route to stream the file from MongoDB
router.get('/upload/file/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    const file = files[0];
    const fileSize = file.length;
    const range = req.headers.range;

    // Support video streaming with range requests
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': file.contentType,
      });

      const downloadStream = bucket.openDownloadStream(fileId, { start, end: end + 1 });
      downloadStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': file.contentType,
      });
      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.pipe(res);
    }
  } catch (err) {
    res.status(500).send('Error retrieving file');
  }
});

module.exports = router;
