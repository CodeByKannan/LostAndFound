const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, authorize } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// @route  GET /api/items
router.get('/', async (req, res) => {
  try {
    const {
      type, category, status = 'active', search,
      page = 1, limit = 12, sort = '-createdAt'
    } = req.query;

    const query = { status };
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('postedBy', 'name email department')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Item.countDocuments(query)
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email department phone')
      .populate('claimedBy', 'name email');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Increment views
    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/items
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, type, category, location, dateLostOrFound, color, brand, tags } = req.body;

    const images = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
      : [];

    const item = await Item.create({
      title,
      description,
      type,
      category,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      dateLostOrFound,
      color,
      brand,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      images,
      postedBy: req.user._id
    });

    await item.populate('postedBy', 'name email department');
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/items/:id
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    }
    if (typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
    if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

    const updated = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('postedBy', 'name email');

    res.json({ item: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const img of item.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/items/user/my-items
router.get('/user/my-items', protect, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
