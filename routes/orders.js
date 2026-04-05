const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
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

// Save order (public)
router.post('/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: 'Order saved', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get orders by email (user)
router.get('/orders/user/:email', async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all orders (admin)
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update order status + tracking (admin)
router.put('/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Updated', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete order (admin)
router.delete('/orders/:id', verifyAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete order (user - from history)
router.delete('/orders/user/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
