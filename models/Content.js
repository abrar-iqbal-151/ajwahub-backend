const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  video: { type: String, default: '' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  weight: { type: String, default: '1kg' },
  rating: { type: Number, default: 4.5 },
  stock: { type: Boolean, default: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  discount: { type: String, default: '50% OFF' },
  category: { type: String, default: 'dates' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = {
  Hero: mongoose.model('Hero', heroSchema, 'description_heroes'),
  Product: mongoose.model('Product', productSchema, 'description_products'),
  Review: mongoose.model('Review', reviewSchema, 'description_reviews')
};
