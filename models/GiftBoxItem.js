const mongoose = require('mongoose');

const giftBoxItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GiftBoxItem', giftBoxItemSchema, 'gift_box_items');
