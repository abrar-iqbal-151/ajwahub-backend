const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  rating: Number,
  reviewText: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
