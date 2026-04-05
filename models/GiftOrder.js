const mongoose = require('mongoose');

const giftOrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, default: '' },
  boxName: { type: String, required: true },
  boxPrice: { type: Number, required: true },
  items: [{ type: Object }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('GiftOrder', giftOrderSchema, 'gift_orders');
