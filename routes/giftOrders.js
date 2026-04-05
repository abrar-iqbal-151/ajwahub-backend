const express = require('express');
const jwt = require('jsonwebtoken');
const GiftOrder = require('../models/GiftOrder');
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

// Save gift order
router.post('/gift-orders', async (req, res) => {
  try {
    const { userEmail, userName, boxName, boxPrice, items, totalPrice } = req.body;
    const order = await GiftOrder.create({ userEmail, userName, boxName, boxPrice, items, totalPrice });
    res.status(201).json({ message: 'Order saved', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all gift orders (admin)
router.get('/gift-orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await GiftOrder.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update status
router.put('/gift-orders/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await GiftOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ message: 'Updated', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete gift order
router.delete('/gift-orders/:id', verifyAdmin, async (req, res) => {
  try {
    await GiftOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
