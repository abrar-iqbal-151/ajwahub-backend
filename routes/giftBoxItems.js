const express = require('express');
const router = express.Router();
const GiftBoxItem = require('../models/GiftBoxItem');

router.get('/', async (req, res) => {
  try {
    const items = await GiftBoxItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, image, price } = req.body;
    const newItem = new GiftBoxItem({ name, image, price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await GiftBoxItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await GiftBoxItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
