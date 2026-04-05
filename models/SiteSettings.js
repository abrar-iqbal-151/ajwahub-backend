const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  location: { type: String, default: 'Madinah, Saudi Arabia' },
  phone: { type: String, default: '+92 300 0000000' },
  email: { type: String, default: 'support@ajwahub.com' },
  hours: { type: String, default: 'Mon–Sat, 9am – 6pm' },
  easypaisaNumber: { type: String, default: '03202017120' },
  jazzcashNumber: { type: String, default: '03202017120' },
  easypaisaName: { type: String, default: 'AjwaHub' },
  jazzcashName: { type: String, default: 'AjwaHub' },
  extraPayments: [{ name: String, number: String, icon: String }],
  shippingCost: { type: Number, default: 200 },
  taxRate: { type: Number, default: 17 },
  discountRate: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema, 'site_settings');
