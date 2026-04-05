const express = require('express');
const jwt = require('jsonwebtoken');
const GiftBox = require('../models/GiftBox');
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

// Initialize default gift boxes (public — auto seed)
router.post('/gift-boxes/initialize', async (req, res) => {
  try {
    const count = await GiftBox.countDocuments();
    if (count > 0) return res.json({ message: 'already exists' });
    const defaults = [
      { name: 'Classic Date Box', image: '/Gift 1.png', description: 'Premium Ajwa dates collection, handpicked from Madinah', maxItems: 1, itemType: 'dates', price: 1200, tag: 'Bestseller' },
      { name: 'Dry Fruits Duo', image: '/Gift 2.png', description: 'Premium dry fruits selection for health lovers', maxItems: 2, itemType: 'dry fruits', price: 1800, tag: 'Popular' },
      { name: 'Mixed Delight', image: '/Gift 3.png', description: 'Mixed dates and dry fruits collection', maxItems: 3, itemType: 'dates & dry fruits', price: 2200, tag: 'New' },
      { name: 'Royal Date Box', image: '/Gift 4.png', description: 'Premium dates collection for special occasions', maxItems: 4, itemType: 'dates', price: 2800, tag: 'Premium' },
      { name: 'Wellness Pack', image: '/Gift 5.png', description: 'Premium dry fruits for daily wellness', maxItems: 5, itemType: 'dry fruits', price: 3200, tag: 'Healthy' },
      { name: 'Grand Mix Box', image: '/Gift 6.png', description: 'Mixed dates and dry fruits luxury package', maxItems: 6, itemType: 'dates & dry fruits', price: 3800, tag: 'Luxury' },
      { name: 'Elite Date Box', image: '/Gift 7.png', description: 'Premium dates collection for gifting', maxItems: 7, itemType: 'dates', price: 4200, tag: 'Elite' },
      { name: 'Ultimate Gift', image: '/Gift 8.png', description: 'The ultimate premium dry fruits gift set', maxItems: 8, itemType: 'dry fruits', price: 5000, tag: '🎁 Special' },
    ];
    await GiftBox.insertMany(defaults);
    res.json({ message: 'initialized' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all gift boxes (public)
router.get('/gift-boxes', async (req, res) => {
  try {
    const boxes = await GiftBox.find().sort({ createdAt: 1 });
    res.json({ boxes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add gift box (admin)
router.post('/gift-boxes', verifyAdmin, async (req, res) => {
  try {
    const box = await GiftBox.create(req.body);
    res.status(201).json({ message: 'Box created', box });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update gift box (admin)
router.put('/gift-boxes/:id', verifyAdmin, async (req, res) => {
  try {
    const box = await GiftBox.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Updated', box });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete gift box (admin)
router.delete('/gift-boxes/:id', verifyAdmin, async (req, res) => {
  try {
    await GiftBox.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
