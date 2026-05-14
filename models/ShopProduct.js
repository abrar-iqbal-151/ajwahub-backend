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
  category: { type: String, default: 'dates' },
  discount: { type: String, default: '' },
  arabicName: { type: String, default: '' },
  storageNote: { type: String, default: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....' },
  weights: { 
    type: Array, 
    default: [
      { label: '1kg Special Box', savings: '' },
      { label: '500g Mini Box', savings: '' },
      { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
      { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
      { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
    ] 
  }
}, { timestamps: true });

module.exports = mongoose.model('ShopProduct', shopProductSchema, 'shop_products');
