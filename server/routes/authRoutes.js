const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, department, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all required fields' });
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, department, phone });
  res.status(201).json({ ...user.toJSON(), token: generateToken(user._id) });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ ...user.toJSON(), token: generateToken(user._id) });
}));

// GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

// PUT /api/auth/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, department, phone } = req.body;
  Object.assign(req.user, { name, department, phone });
  await req.user.save();
  res.json(req.user);
}));

// PUT /api/auth/password
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
}));

module.exports = router;
