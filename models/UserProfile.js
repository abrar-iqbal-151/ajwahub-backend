const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  username: { type: String, default: '' },
  phone: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  addresses: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
    postalCode: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema, 'profiles');
