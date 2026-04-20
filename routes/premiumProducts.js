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

// Initialize sample premium products
router.post('/premium-products/initialize', verifyAdmin, async (req, res) => {
  try {
    const count = await PremiumProduct.countDocuments();
    if (count > 0) return res.json({ message: 'already exists' });
    await PremiumProduct.insertMany([
      { name: 'Royal Ajwa Dates', description: 'Finest Ajwa dates from Madinah — rich in nutrients and naturally sweet.', price: 2500, originalPrice: 3200, image: '/Ajwa dry 4.png', category: 'dates', badge: 'Premium', stock: true, rating: 4.9, weight: '500g', featured: true },
      { name: 'Premium Medjool', description: 'Large, soft and luxuriously sweet Medjool dates — king of all dates.', price: 3500, originalPrice: 4500, image: '/Badam dry 1.png', category: 'dates', badge: 'Luxury', stock: true, rating: 4.8, weight: '1kg', featured: true },
      { name: 'Golden Almonds', description: 'Hand-picked premium almonds — rich in protein and healthy fats.', price: 1800, originalPrice: 2200, image: '/Kaju dry 2.png', category: 'dry', badge: 'New', stock: true, rating: 4.7, weight: '500g', featured: true },
      { name: 'Premium Pistachios', description: 'Roasted premium pistachios — perfect snack for health enthusiasts.', price: 2800, originalPrice: 3500, image: '/Pista dry 3.png', category: 'dry', badge: 'Hot', stock: true, rating: 4.8, weight: '500g', featured: false },
      { name: 'Kashmiri Walnuts', description: 'Premium Kashmiri walnuts — brain food packed with omega-3.', price: 2200, originalPrice: 2800, image: '/Kishmish dry 5.png', category: 'dry', badge: 'Premium', stock: true, rating: 4.6, weight: '500g', featured: false },
    ]);
    res.json({ message: 'initialized' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

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
