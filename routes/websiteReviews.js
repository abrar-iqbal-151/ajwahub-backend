const express = require('express');
const router = express.Router();
const WebsiteReview = require('../models/WebsiteReview');

// Create a new website review
router.post('/website-reviews', async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    if (!rating || !reviewText) {
      return res.status(400).json({ success: false, error: 'Rating and review text are required' });
    }
    const newReview = new WebsiteReview({ rating, reviewText });
    await newReview.save();
    res.json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all website reviews (Admin access)
router.get('/website-reviews', async (req, res) => {
  try {
    const reviews = await WebsiteReview.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a website review
router.delete('/website-reviews/:id', async (req, res) => {
  try {
    await WebsiteReview.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
