const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
}, { timestamps: true });

module.exports = mongoose.model('AiHistory', aiHistorySchema);
