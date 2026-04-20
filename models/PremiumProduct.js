const mongoose = require('mongoose');

const PremiumProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  image: { type: String, default: '' },
  category: { type: String, default: 'dates' },
  badge: { type: String, default: 'Premium' },
  stock: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  weight: { type: String, default: '1kg' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PremiumProduct', PremiumProductSchema);
