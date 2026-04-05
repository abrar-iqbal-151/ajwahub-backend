const express = require('express');
const jwt = require('jsonwebtoken');
const HomeContent = require('../models/HomeContent');
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

const defaultData = {
  key: 'main',
  sliderImages: ['/home mock 1.png', '/home mock 2.png', '/home mock 3.png'],
  sections: [
    { key: 'dates', title: 'SPECIAL DATES', items: [
      { name: 'Premium Ajwa', image: '/Home dates 1.png' },
      { name: 'Brown Ajwa', image: '/Home dates 2.png' },
      { name: 'Sukkari Dates', image: '/Home dates 3.png' },
      { name: 'Arabic Dates', image: '/Home dates 4.png' },
      { name: 'Lahori Dates', image: '/Home dates 5.png' }
    ]},
    { key: 'dryfruits', title: 'SPECIAL DRY FRUITS', items: [
      { name: 'Badam', image: '/Badam dry 1.png' },
      { name: 'Kaju', image: '/Kaju dry 2.png' },
      { name: 'Pista', image: '/Pista dry 3.png' },
      { name: 'Akhrot', image: '/Akhrot dry 4.png' },
      { name: 'Kishmish', image: '/Kishmish dry 5.png' }
    ]},
    { key: 'packaging', title: 'SPECIAL PACKAGING', items: [
      { name: 'Elegant Box', image: '/Home pakege 1.png' },
      { name: 'Royal Package', image: '/Home pakege 2.png' },
      { name: 'Premium Gift', image: '/Home pakege 3.png' },
      { name: 'Luxury Pack', image: '/Home pakege 4.png' },
      { name: 'Deluxe Box', image: '/Home pakege 5.png' }
    ]},
    { key: 'premium', title: 'PREMIUM COLLECTION', items: [
      { name: 'Gold Edition', image: '/Home premium 2.png' },
      { name: 'Royal Selection', image: '/Home premium 1.png' },
      { name: 'Elite Pack', image: '/Home premium 3.png' },
      { name: 'Signature Box', image: '/Home premium 4.png' },
      { name: 'Exclusive Range', image: '/Home premium 5.png' }
    ]},
    { key: 'gifts', title: 'SPECIAL GIFT BOXES', items: [
      { name: 'Gift Box Classic', image: '/Home gift 1.png' },
      { name: 'Festive Collection', image: '/Home gift 2.png' },
      { name: 'Celebration Pack', image: '/Home gift 3.png' },
      { name: 'Special Occasion', image: '/Home gift 4.png' },
      { name: 'Grand Gift Set', image: '/Home gift 5.png' }
    ]},
    { key: 'fitness', title: 'FITNESS & WELLNESS', items: [
      { name: 'Morning Energy Boost', video: '/home vedio 1.mp4' },
      { name: 'Power Cardio', video: '/home vedio 2.mp4' },
      { name: 'Muscle Building', video: '/home vedio 3.mp4' },
      { name: 'Flexibility & Balance', video: '/home vedio 4.mp4' },
      { name: 'Fat Burn Intense', video: '/home vedio 5.mp4' }
    ]}
  ],
  discountTitle: '🎉 50% OFF',
  discountText: '✨ Limited Time Offer on Premium Products! ✨',
  stats: [
    { number: '50K+', label: 'Happy Customers' },
    { number: '100%', label: 'Authentic Products' },
    { number: '24/7', label: 'Customer Support' },
    { number: '4.9★', label: 'Average Rating' }
  ]
};

// GET home content
router.get('/home-content', async (req, res) => {
  try {
    let content = await HomeContent.findOne({ key: 'main' });
    if (!content) content = defaultData;
    res.json({ content });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Initialize
router.post('/home-content/initialize', verifyAdmin, async (req, res) => {
  try {
    const exists = await HomeContent.findOne({ key: 'main' });
    if (exists) return res.json({ message: 'already exists' });
    await HomeContent.create(defaultData);
    res.json({ message: 'initialized' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update full content
router.put('/home-content', verifyAdmin, async (req, res) => {
  try {
    const content = await HomeContent.findOneAndUpdate(
      { key: 'main' }, req.body, { new: true, upsert: true }
    );
    res.json({ message: 'Updated', content });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update single section
router.put('/home-content/section/:key', verifyAdmin, async (req, res) => {
  try {
    const content = await HomeContent.findOne({ key: 'main' });
    if (!content) return res.status(404).json({ message: 'Not found' });
    const idx = content.sections.findIndex(s => s.key === req.params.key);
    if (idx === -1) return res.status(404).json({ message: 'Section not found' });
    content.sections[idx] = { ...content.sections[idx].toObject(), ...req.body };
    await content.save();
    res.json({ message: 'Section updated', content });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update discount & stats
router.put('/home-content/banner', verifyAdmin, async (req, res) => {
  try {
    const { discountTitle, discountText, stats } = req.body;
    const content = await HomeContent.findOneAndUpdate(
      { key: 'main' }, { discountTitle, discountText, stats }, { new: true }
    );
    res.json({ message: 'Banner updated', content });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
