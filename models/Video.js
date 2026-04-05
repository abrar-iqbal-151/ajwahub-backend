const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, default: 'health' },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema, 'gymai_videos');
