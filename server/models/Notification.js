const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['claim_received', 'claim_approved', 'claim_rejected', 'item_match', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
