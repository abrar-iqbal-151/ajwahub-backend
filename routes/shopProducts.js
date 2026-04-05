const express = require('express');
const jwt = require('jsonwebtoken');
const ShopProduct = require('../models/ShopProduct');
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

const defaultProducts = [
  { id: 1, name: 'Ajwa Dates', price: 1200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 1.png', description: '🌟 Sacred dates from Madinah\nPremium quality blessed fruit', category: 'dates' },
  { id: 2, name: 'Medjool Dates', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 2.png', description: '👑 King of dates - large & soft\nNaturally sweet luxury treat', category: 'dates' },
  { id: 3, name: 'Deglet Dates', price: 1000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 3.png', description: '✨ Golden translucent sweetness\nDelicate flavor and texture', category: 'dates' },
  { id: 4, name: 'Zahidi Dates', price: 900, weight: '1kg', rating: 4.4, stock: true, image: '/Product 4.png', description: '🥇 Premium golden variety\nFirm texture with rich taste', category: 'dates' },
  { id: 5, name: 'Almonds', price: 1500, weight: '1kg', rating: 4.6, stock: true, image: '/Product 5.png', description: '🌰 Heart-healthy protein power\nCrunchy nutritious superfood', category: 'dry' },
  { id: 6, name: 'Cashews', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 6.png', description: '🥜 Buttery smooth crunch\nCreamy texture premium nuts', category: 'dry' },
  { id: 7, name: 'Walnuts', price: 2000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 7.png', description: '🧠 Omega-3 brain food\nHealthy fats for mental clarity', category: 'dry' },
  { id: 8, name: 'Pistachios', price: 2500, weight: '1kg', rating: 4.8, stock: true, image: '/Product 8.png', description: '💚 Roasted green perfection\nSalty snack with natural flavor', category: 'dry' },
  { id: 9, name: 'Raisins', price: 600, weight: '1kg', rating: 4.2, stock: true, image: '/Product 9.png', description: '🍇 Sun-dried energy boost\nSweet chewy natural candy', category: 'dry' },
  { id: 10, name: 'Dried Figs', price: 1200, weight: '1kg', rating: 4.4, stock: true, image: '/Product 10.png', description: '🌸 Honey-sweet with seeds\nFiber-rich Mediterranean delight', category: 'dry' },
  { id: 11, name: 'Hazelnuts', price: 1900, weight: '1kg', rating: 4.5, stock: true, image: '/Product 11.png', description: '🌰 Rich buttery kernels\nPerfect for baking and snacking', category: 'dry' },
  { id: 12, name: 'Brazil Nuts', price: 2200, weight: '1kg', rating: 4.3, stock: true, image: '/Product 12.png', description: '🌳 Selenium-rich giants\nAmazonian superfood powerhouse', category: 'dry' },
  { id: 13, name: 'Pecans', price: 2800, weight: '1kg', rating: 4.6, stock: true, image: '/Product 13.png', description: '🍂 Buttery sweet halves\nSouthern delicacy premium quality', category: 'dry' },
  { id: 14, name: 'Pine Nuts', price: 3500, weight: '250g', rating: 4.7, stock: true, image: '/Product 14.png', description: '🌲 Gourmet cooking essential\nDelicate flavor culinary treasure', category: 'dry' },
  { id: 15, name: 'Macadamias', price: 3200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 15.png', description: '🏝️ Tropical luxury crunch\nHawaiian paradise in every bite', category: 'dry' },
  { id: 16, name: 'Dried Apricots', price: 800, weight: '1kg', rating: 4.3, stock: true, image: '/Product 16.png', description: '🍑 Tangy-sweet chewy treat\nVitamin A packed sunshine fruit', category: 'dry' },
  { id: 17, name: 'Dates Mix', price: 1400, weight: '1kg', rating: 4.6, stock: true, image: '/Product 17.png', description: '🎯 Premium variety pack\nAssorted dates collection bundle', category: 'dates' },
  { id: 18, name: 'Nuts Mix', price: 2200, weight: '1kg', rating: 4.7, stock: true, image: '/Product 18.png', description: '🥜 Gourmet mixed selection\nPerfect blend of premium nuts', category: 'dry' },
  { id: 19, name: 'Trail Mix', price: 1600, weight: '1kg', rating: 4.4, stock: true, image: '/Product 19.png', description: '🥾 Healthy energy blend\nAdventure fuel for active lifestyle', category: 'dry' },
  { id: 20, name: 'Gift Box', price: 3000, weight: '1kg', rating: 4.9, stock: true, image: '/Product 20.png', description: '🎁 Luxury gift assortment\nPerfect present for loved ones', category: 'dates' }
];

// GET all
router.get('/shop-products', async (req, res) => {
  try {
    const products = await ShopProduct.find().sort({ id: 1 });
    res.json({ products });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Initialize
router.post('/shop-products/initialize', verifyAdmin, async (req, res) => {
  try {
    const count = await ShopProduct.countDocuments();
    if (count > 0) return res.json({ message: 'already exists' });
    await ShopProduct.insertMany(defaultProducts);
    res.json({ message: 'initialized' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add new product
router.post('/shop-products', verifyAdmin, async (req, res) => {
  try {
    const { name, price, weight, rating, stock, image, description, category } = req.body;
    const lastProduct = await ShopProduct.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;
    const product = await ShopProduct.create({ id: newId, name, price, weight: weight || '1kg', rating: rating || 4.5, stock: stock !== undefined ? stock : true, image: image || '', description: description || '', category: category || 'dates' });
    res.status(201).json({ message: 'Product added', product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update single product
router.put('/shop-products/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, price, weight, rating, stock, image, description, category } = req.body;
    const product = await ShopProduct.findOneAndUpdate(
      { id: req.params.id },
      { name, price, weight, rating, stock, image, description, category },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Updated', product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
