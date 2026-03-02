const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: {
    type: String, required: true,
    enum: ['Electronics', 'Clothing', 'Books', 'ID/Cards', 'Keys', 'Bags', 'Jewelry', 'Sports', 'Other'],
  },
  type: { type: String, required: true, enum: ['lost', 'found'] },
  status: { type: String, enum: ['active', 'claimed', 'resolved', 'expired'], default: 'active' },
  location: {
    building: { type: String, required: true },
    area: { type: String },
    description: { type: String },
  },
  dateLostFound: { type: Date, required: true },
  images: [{ url: String, publicId: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  views: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  contactInfo: {
    email: String,
    phone: String,
    preferEmail: { type: Boolean, default: true },
  },
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text', tags: 'text' });
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
