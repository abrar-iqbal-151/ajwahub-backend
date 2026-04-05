const mongoose = require('mongoose');

const shopProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  weight: { type: String, default: '1kg' },
  rating: { type: Number, default: 4.5 },
  stock: { type: Boolean, default: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: 'dates' }
}, { timestamps: true });

module.exports = mongoose.model('ShopProduct', shopProductSchema, 'shop_products');
