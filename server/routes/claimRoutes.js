const express = require('express');
const asyncHandler = require('express-async-handler');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// POST /api/claims — submit a claim
router.post('/', protect, upload.array('proofImages', 3), asyncHandler(async (req, res) => {
  const { itemId, message, proofDescription } = req.body;
  const item = await Item.findById(itemId).populate('postedBy');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (item.status !== 'active') return res.status(400).json({ message: 'Item is no longer available for claiming' });
  if (item.postedBy._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot claim your own posting' });
  }
  const existing = await Claim.findOne({ item: itemId, claimedBy: req.user._id });
  if (existing) return res.status(400).json({ message: 'You have already submitted a claim for this item' });

  const proofImages = (req.files || []).map(f => ({ url: f.path, publicId: f.filename }));
  const claim = await Claim.create({ item: itemId, claimedBy: req.user._id, message, proofDescription, proofImages });

  // Notify item poster
  await Notification.create({
    user: item.postedBy._id,
    type: 'claim_received',
    title: 'New Claim Received',
    message: `${req.user.name} has submitted a claim for your item "${item.title}".`,
    item: item._id,
    claim: claim._id,
  });

  await claim.populate([{ path: 'claimedBy', select: 'name avatar email' }, { path: 'item', select: 'title type' }]);
  res.status(201).json(claim);
}));

// GET /api/claims/item/:itemId — get claims for an item (item owner or admin)
router.get('/item/:itemId', protect, asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const claims = await Claim.find({ item: req.params.itemId })
    .populate('claimedBy', 'name avatar email department phone')
    .sort('-createdAt');
  res.json(claims);
}));

// GET /api/claims/mine — current user's claims
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const claims = await Claim.find({ claimedBy: req.user._id })
    .populate('item', 'title type category images status')
    .sort('-createdAt');
  res.json(claims);
}));

// PATCH /api/claims/:id/review — approve or reject
router.patch('/:id/review', protect, asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate('item');
  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  const item = claim.item;
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { status, adminNote } = req.body;
  claim.status = status;
  claim.adminNote = adminNote;
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();
  await claim.save();

  if (status === 'approved') {
    await Item.findByIdAndUpdate(item._id, { status: 'claimed', claimedBy: claim.claimedBy });
    // Reject other pending claims
    await Claim.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
      { status: 'rejected', adminNote: 'Item has been claimed by another user.' }
    );
  }

  await Notification.create({
    user: claim.claimedBy,
    type: status === 'approved' ? 'claim_approved' : 'claim_rejected',
    title: status === 'approved' ? '🎉 Claim Approved!' : 'Claim Update',
    message: status === 'approved'
      ? `Your claim for "${item.title}" has been approved! Please coordinate pickup.`
      : `Your claim for "${item.title}" was not approved. ${adminNote || ''}`,
    item: item._id,
    claim: claim._id,
  });

  res.json(claim);
}));

// GET /api/claims — all claims (admin only)
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const claims = await Claim.find()
    .populate('claimedBy', 'name email')
    .populate('item', 'title type category')
    .sort('-createdAt')
    .limit(100);
  res.json(claims);
}));

module.exports = router;
