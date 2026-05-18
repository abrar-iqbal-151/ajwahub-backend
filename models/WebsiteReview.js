const mongoose = require('mongoose');

const websiteReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  reviewText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebsiteReview', websiteReviewSchema);
