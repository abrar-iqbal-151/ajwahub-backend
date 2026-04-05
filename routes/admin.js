const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const router = express.Router();

const generateToken = (adminId) => {
  return jwt.sign({ adminId, role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'secret-key', { expiresIn: '7d' });
};

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret-key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin Signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: 'Admin already exists with this email' });

    const admin = await Admin.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(admin._id);

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      token
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error during admin signup' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(admin._id);

    res.json({
      message: 'Admin login successful',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Get all users (protected)
router.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all wishlists (admin)
router.get('/admin/wishlists', verifyAdmin, async (req, res) => {
  try {
    const Wishlist = require('../models/Wishlist');
    const User = require('../models/User');
    const wishlists = await Wishlist.find();
    const wishlistsWithNames = await Promise.all(wishlists.map(async (w) => {
      const user = await User.findOne({ email: w.email }).select('name');
      return { ...w.toObject(), userName: user?.name || w.email };
    }));
    res.json({ wishlists: wishlistsWithNames });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove a product from all wishlists (admin)
router.delete('/admin/wishlists/product/:productId', verifyAdmin, async (req, res) => {
  try {
    const Wishlist = require('../models/Wishlist');
    const { productId } = req.params;
    await Wishlist.updateMany(
      { 'products.id': productId },
      { $pull: { products: { id: productId } } }
    );
    res.json({ message: 'Product removed from all wishlists' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
