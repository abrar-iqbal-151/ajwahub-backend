const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// In-memory OTP store
const otpStore = {};

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'AjwaHub - Password Reset Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a0000;color:#fff;padding:30px;border-radius:12px">
        <h2 style="color:#fb923c;text-align:center">🌴 AjwaHub</h2>
        <h3 style="text-align:center">Password Reset Code</h3>
        <div style="background:#3a0808;border:1px solid rgba(251,146,60,0.3);border-radius:10px;padding:20px;text-align:center;margin:20px 0">
          <p style="color:#d4cccc;margin-bottom:10px">Your verification code is:</p>
          <h1 style="color:#fb923c;font-size:40px;letter-spacing:8px;margin:0">${otp}</h1>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `
  });
};

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Email not found', field: 'email' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP error:', err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email?.toLowerCase()];
  if (!record) return res.status(400).json({ message: 'OTP not found. Please request again.' });
  if (Date.now() > record.expires) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ message: 'OTP expired. Please request again.' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP code.' });
  delete otpStore[email.toLowerCase()];
  res.json({ message: 'OTP verified' });
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET || 'secret-key', { expiresIn: '7d' });
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name.trim()) || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must contain only letters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Email not found', field: 'email' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password', field: 'password' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorSecret: user.twoFactorSecret
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Change password (logged in user)
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Check email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({ exists: !!user });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'All fields required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
