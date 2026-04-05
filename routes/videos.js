const express = require('express');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret-key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// Get all videos (public)
router.get('/gymai/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json({ videos });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add video (admin)
router.post('/gymai/videos', verifyAdmin, async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json({ message: 'Video added', video });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete video (admin)
router.delete('/gymai/videos/:id', verifyAdmin, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
