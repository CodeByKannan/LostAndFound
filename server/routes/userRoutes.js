const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/notifications
router.get('/notifications', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt').limit(50);
  res.json(notifications);
}));

// PATCH /api/users/notifications/read
router.patch('/notifications/read', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'Notifications marked as read' });
}));

// GET /api/users — admin only
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt').select('-password');
  res.json(users);
}));

// PATCH /api/users/:id/role — admin only
router.patch('/:id/role', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// GET /api/users/stats — admin dashboard stats
router.get('/admin/stats', protect, adminOnly, asyncHandler(async (req, res) => {
  const Item = require('../models/Item');
  const Claim = require('../models/Claim');
  const [totalItems, lostItems, foundItems, resolvedItems, totalUsers, totalClaims] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ type: 'lost', status: 'active' }),
    Item.countDocuments({ type: 'found', status: 'active' }),
    Item.countDocuments({ status: 'resolved' }),
    User.countDocuments(),
    Claim.countDocuments(),
  ]);
  res.json({ totalItems, lostItems, foundItems, resolvedItems, totalUsers, totalClaims });
}));

module.exports = router;
