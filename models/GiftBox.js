const mongoose = require('mongoose');

const giftBoxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  maxItems: { type: Number, default: 1 },
  itemType: { type: String, default: 'dates & dry fruits' },
  price: { type: Number, required: true },
  tag: { type: String, default: 'New' },
}, { timestamps: true });

module.exports = mongoose.model('GiftBox', giftBoxSchema, 'gift_boxes');
