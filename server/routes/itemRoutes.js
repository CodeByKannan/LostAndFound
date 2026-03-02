const express = require('express');
const asyncHandler = require('express-async-handler');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// GET /api/items — list with filters & pagination
router.get('/', asyncHandler(async (req, res) => {
  const { type, category, status = 'active', search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const total = await Item.countDocuments(query);
  const items = await Item.find(query)
    .populate('postedBy', 'name avatar department')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ items, total, pages: Math.ceil(total / limit), page: Number(page) });
}));

// GET /api/items/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('postedBy', 'name avatar department email phone');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
}));

// POST /api/items
router.post('/', protect, upload.array('images', 4), asyncHandler(async (req, res) => {
  const { title, description, category, type, building, area, locationDesc, dateLostFound, tags, contactEmail, contactPhone, preferEmail } = req.body;
  const images = (req.files || []).map(f => ({ url: f.path, publicId: f.filename }));

  const item = await Item.create({
    title, description, category, type,
    location: { building, area, description: locationDesc },
    dateLostFound,
    images,
    postedBy: req.user._id,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    contactInfo: { email: contactEmail || req.user.email, phone: contactPhone, preferEmail: preferEmail !== 'false' },
  });

  // Notify matching items
  const matchType = type === 'lost' ? 'found' : 'lost';
  const matches = await Item.find({ type: matchType, category, status: 'active' }).populate('postedBy');
  for (const match of matches.slice(0, 5)) {
    await Notification.create({
      user: match.postedBy._id,
      type: 'item_match',
      title: 'Potential Match Found!',
      message: `A new ${type} item "${title}" in ${category} might match your posting.`,
      item: item._id,
    });
  }

  await item.populate('postedBy', 'name avatar department');
  res.status(201).json(item);
}));

// PUT /api/items/:id
router.put('/:id', protect, upload.array('images', 4), asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const newImages = (req.files || []).map(f => ({ url: f.path, publicId: f.filename }));
  const { title, description, category, building, area, locationDesc, dateLostFound, tags, status } = req.body;

  Object.assign(item, {
    title: title || item.title,
    description: description || item.description,
    category: category || item.category,
    location: { building: building || item.location.building, area, description: locationDesc },
    dateLostFound: dateLostFound || item.dateLostFound,
    tags: tags ? tags.split(',').map(t => t.trim()) : item.tags,
    status: status || item.status,
    images: [...item.images, ...newImages],
  });

  await item.save();
  await item.populate('postedBy', 'name avatar department');
  res.json(item);
}));

// DELETE /api/items/:id
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  for (const img of item.images) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
  }
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
}));

// GET /api/items/user/mine
router.get('/user/mine', protect, asyncHandler(async (req, res) => {
  const items = await Item.find({ postedBy: req.user._id }).sort('-createdAt');
  res.json(items);
}));

// PATCH /api/items/:id/resolve
router.patch('/:id/resolve', protect, asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  item.status = 'resolved';
  item.isResolved = true;
  item.resolvedAt = new Date();
  await item.save();
  res.json(item);
}));

module.exports = router;
