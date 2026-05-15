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
  arabicName: { type: String, default: '' },
  price: { type: Number, required: true },
  weight: { type: String, default: '1kg' },
  rating: { type: Number, default: 4.5 },
  stock: { type: Boolean, default: true },
  image: { type: String, default: '' },
  detailImage: { type: String, default: '' },
  description: { type: String, default: '' },
  discount: { type: String, default: '50% OFF' },
  category: { type: String, default: 'dates' },
  storageNote: { type: String, default: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....' },
  weights: [{
    label: { type: String },
    savings: { type: String }
  }]
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 }
}, { timestamps: true });

const featureSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'feature1' },
  title: { type: String, default: 'Why Choose AjwaHub?' },
  description: { type: String, default: 'We bring you the finest handpicked dates and dry fruits straight from the source. Every product is carefully selected for freshness, taste, and nutritional value.' },
  images: [{ type: String }],
  features: [{
    icon: { type: String, default: '✅' },
    text: { type: String, required: true }
  }]
}, { timestamps: true });

const deliveryMapSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'deliveryMap1' },
  title: { type: String, default: 'We Deliver Across Pakistan' },
  mapImage: { type: String, default: '/pakistan-delivery-map.png' }
}, { timestamps: true });

const aboutSectionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'about1' },
  title: { type: String, default: 'How Our Dates Are Grown' },
  paragraphs: [{ type: String }],
  images: [{ type: String }]
}, { timestamps: true });

const paymentIconsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'payment1' },
  icons: [{ type: String }]
}, { timestamps: true });

const aiSectionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'aiSection1' },
  badge: { type: String, default: 'AI POWERED WELLNESS' },
  title: { type: String, default: 'Personalized Health with AjwaHub Intelligence' },
  description: { type: String, default: 'Step into the future of nutrition. Our proprietary AI analyzes your wellness goals to recommend the perfect date varieties and nutritional plans tailored specifically for your lifestyle.' },
  video: { type: String, default: '/ai-preview.mp4' },
  features: [{
    icon: { type: String, default: '🤖' },
    title: { type: String, required: true },
    text: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = {
  Hero: mongoose.model('Hero', heroSchema, 'description_heroes'),
  Product: mongoose.model('Product', productSchema, 'description_products'),
  Review: mongoose.model('Review', reviewSchema, 'description_reviews'),
  Feature: mongoose.model('Feature', featureSchema, 'description_features'),
  DeliveryMap: mongoose.model('DeliveryMap', deliveryMapSchema, 'description_delivery_maps'),
  AboutSection: mongoose.model('AboutSection', aboutSectionSchema, 'description_about'),
  PaymentIcons: mongoose.model('PaymentIcons', paymentIconsSchema, 'description_payment_icons'),
  AiSection: mongoose.model('AiSection', aiSectionSchema, 'description_ai_sections')
};

