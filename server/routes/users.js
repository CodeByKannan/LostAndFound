const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const { protect, authorize } = require('../middleware/auth');

// @route  GET /api/users (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/users/:id/role (admin)
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/users/stats (admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalItems, lostItems, foundItems, resolvedItems] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost', status: 'active' }),
      Item.countDocuments({ type: 'found', status: 'active' }),
      Item.countDocuments({ status: 'claimed' })
    ]);

    res.json({ totalUsers, totalItems, lostItems, foundItems, resolvedItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
