const express = require('express');
const Wishlist = require('../models/Wishlist');
const router = express.Router();

// GET wishlist
router.get('/wishlist/:email', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ email: req.params.email.toLowerCase() });
    res.json({ products: wishlist?.products || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// SAVE wishlist
router.put('/wishlist/:email', async (req, res) => {
  try {
    const { products } = req.body;
    const wishlist = await Wishlist.findOneAndUpdate(
      { email: req.params.email.toLowerCase() },
      { products },
      { new: true, upsert: true }
    );
    res.json({ message: 'Wishlist saved', products: wishlist.products });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
