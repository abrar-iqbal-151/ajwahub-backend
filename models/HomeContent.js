const mongoose = require('mongoose');

const sectionItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  image: { type: String, default: '' },
  video: { type: String, default: '' }
});

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  items: [sectionItemSchema]
});

const homeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  // slider
  sliderImages: [{ type: String }],
  // sections
  sections: [sectionSchema],
  // discount banner
  discountTitle: { type: String, default: '🎉 50% OFF' },
  discountText: { type: String, default: '✨ Limited Time Offer on Premium Products! ✨' },
  // stats
  stats: [{
    number: { type: String, default: '' },
    label: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HomeContent', homeSchema, 'home_content');
