const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');

// Create a new rating
router.post('/ratings', async (req, res) => {
  try {
    const { productId, productName, rating, reviewText } = req.body;
    const newRating = new Rating({ productId, productName, rating, reviewText });
    await newRating.save();
    res.json({ success: true, rating: newRating });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all ratings (for Admin / General)
router.get('/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get ratings by product
router.get('/ratings/product/:productId', async (req, res) => {
  try {
    const ratings = await Rating.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a rating
router.delete('/ratings/:id', async (req, res) => {
  try {
    await Rating.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
