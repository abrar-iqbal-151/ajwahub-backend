const express = require('express');
const router = express.Router();
const PremiumProduct = require('../models/PremiumProduct');
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret-key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    req.admin = decoded;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// GET all
router.get('/premium-products', async (req, res) => {
  try {
    const products = await PremiumProduct.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST add
router.post('/premium-products', verifyAdmin, async (req, res) => {
  try {
    const product = await PremiumProduct.create(req.body);
    res.status(201).json({ product });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PUT update
router.put('/premium-products/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await PremiumProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// DELETE
router.delete('/premium-products/:id', verifyAdmin, async (req, res) => {
  try {
    await PremiumProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
