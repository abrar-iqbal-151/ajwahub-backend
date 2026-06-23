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
    
    // Auto Stock Management Logic
    if (order.items && Array.isArray(order.items)) {
      const ShopProduct = require('../models/ShopProduct');
      for (const item of order.items) {
        // Find product by name or id
        // assuming item has 'name' or 'id'
        const product = await ShopProduct.findOne({ name: item.name });
        if (product && product.autoStockManagement) {
          // Calculate kg to deduct
          let kgToDeduct = 0;
          const qty = item.quantity || 1;
          const weightStr = item.weight ? item.weight.toLowerCase() : '1kg';
          
          if (weightStr.includes('kg')) {
            const num = parseFloat(weightStr.replace(/[^0-9.]/g, ''));
            kgToDeduct = (isNaN(num) ? 1 : num) * qty;
          } else if (weightStr.includes('g')) {
            const num = parseFloat(weightStr.replace(/[^0-9.]/g, ''));
            kgToDeduct = (isNaN(num) ? 500 : num) / 1000 * qty;
          } else {
            kgToDeduct = 1 * qty; // fallback to 1kg per item if unknown
          }

          if (kgToDeduct > 0) {
            product.totalStockKg -= kgToDeduct;
            if (product.totalStockKg <= product.thresholdKg) {
              product.stock = false; // Automatically un-stock
            }
            await product.save();
          }
        }
      }
    }

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
