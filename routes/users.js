const express = require('express');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const router = express.Router();

// Get user profile by email
router.get('/profile/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = await UserProfile.findOne({ email }) || {};
    res.json({
      user: {
        ...user.toObject(),
        username: profile.username || '',
        phone: profile.phone || '',
        profilePicture: profile.profilePicture || ''
      }
    });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Update user profile
router.put('/profile/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const { name, username, phone, profilePicture, twoFactorEnabled } = req.body;
    await User.findOneAndUpdate({ email }, { name, twoFactorEnabled });
    await UserProfile.findOneAndUpdate(
      { email },
      { name, username, phone, profilePicture },
      { new: true, upsert: true }
    );
    res.json({ message: 'Profile updated', user: { email, name, username, phone, profilePicture, twoFactorEnabled } });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// 2FA toggle
router.post('/2fa/toggle', async (req, res) => {
  try {
    const { email, enabled, secret } = req.body;
    const update = enabled
      ? { twoFactorEnabled: true, twoFactorSecret: secret }
      : { twoFactorEnabled: false, twoFactorSecret: '' };
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() }, update, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'}`, user });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Get addresses
router.get('/addresses/:email', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ email: req.params.email.toLowerCase() });
    res.json({ addresses: profile?.addresses || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add address
router.post('/addresses/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const newAddr = { ...req.body, id: new (require('mongoose').Types.ObjectId)().toString() };
    let profile = await UserProfile.findOne({ email });
    if (!profile) profile = new UserProfile({ email, addresses: [] });
    if (newAddr.isDefault) profile.addresses.forEach(a => a.isDefault = false);
    if (profile.addresses.length === 0) newAddr.isDefault = true;
    profile.addresses.push(newAddr);
    await profile.save();
    res.json({ message: 'Address added', addresses: profile.addresses });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update address
router.put('/addresses/:email/:id', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const profile = await UserProfile.findOne({ email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const idx = profile.addresses.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) profile.addresses.forEach(a => a.isDefault = false);
    profile.addresses[idx] = { ...profile.addresses[idx].toObject(), ...req.body, id: req.params.id };
    await profile.save();
    res.json({ message: 'Address updated', addresses: profile.addresses });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete address
router.delete('/addresses/:email/:id', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const profile = await UserProfile.findOne({ email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.addresses = profile.addresses.filter(a => a.id !== req.params.id);
    if (profile.addresses.length > 0 && !profile.addresses.some(a => a.isDefault)) {
      profile.addresses[0].isDefault = true;
    }
    await profile.save();
    res.json({ message: 'Address deleted', addresses: profile.addresses });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Set default address
router.put('/addresses/:email/:id/default', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const profile = await UserProfile.findOne({ email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.addresses.forEach(a => a.isDefault = a.id === req.params.id);
    await profile.save();
    res.json({ message: 'Default address set', addresses: profile.addresses });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
