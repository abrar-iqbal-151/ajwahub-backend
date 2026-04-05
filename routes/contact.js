const express = require('express');
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');
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

// Save contact message (public)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Required fields missing' });
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent', contact });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all messages (admin)
router.get('/contact', verifyAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark as read (admin)
router.put('/contact/:id/read', verifyAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete message (admin)
router.delete('/contact/:id', verifyAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get site settings (public)
router.get('/settings', async (req, res) => {
  try {
    const SiteSettings = require('../models/SiteSettings');
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json({ settings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update site settings (admin)
router.put('/settings', verifyAdmin, async (req, res) => {
  try {
    const SiteSettings = require('../models/SiteSettings');
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create(req.body);
    else { Object.assign(settings, req.body); await settings.save(); }
    res.json({ message: 'Updated', settings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
