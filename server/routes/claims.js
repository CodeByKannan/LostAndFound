const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { protect, authorize } = require('../middleware/auth');

// @route  POST /api/claims
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message, proofDescription } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'active') return res.status(400).json({ message: 'Item is no longer active' });
    if (item.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }

    const existing = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already submitted a claim for this item' });

    const claim = await Claim.create({ item: itemId, claimant: req.user._id, message, proofDescription });
    await claim.populate([
      { path: 'item', select: 'title type' },
      { path: 'claimant', select: 'name email' }
    ]);

    res.status(201).json({ claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/claims/item/:itemId
router.get('/item/:itemId', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email studentId department phone')
      .sort('-createdAt');

    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/claims/my-claims
router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title type category status images')
      .sort('-createdAt');
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/claims/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const isOwner = claim.item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, adminNotes } = req.body;
    claim.status = status;
    if (adminNotes) claim.adminNotes = adminNotes;
    await claim.save();

    // If approved, mark item as claimed
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, {
        status: 'claimed',
        claimedBy: claim.claimant
      });
    }

    res.json({ claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/claims (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'title type')
      .populate('claimant', 'name email')
      .sort('-createdAt');
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
