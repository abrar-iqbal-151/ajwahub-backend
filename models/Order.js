const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userEmail: { type: String, default: '' },
  items: [{ type: Object }],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'card' },
  status: { type: String, default: 'Pending Approval' },
  trackingStatus: { type: String, default: 'warehouse' },
  paymentScreenshot: { type: String, default: null },
  shippingId: { type: String, default: '' },
  shippingCompany: { type: String, default: '' },
  shippingMessage: { type: String, default: '' },
  shippingAddress: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema, 'orders');
