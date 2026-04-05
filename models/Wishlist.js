const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  products: [{ type: Object }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema, 'wishlists');
