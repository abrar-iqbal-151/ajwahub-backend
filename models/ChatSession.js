const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  messages: [
    {
      role: { type: String, enum: ['user', 'model'] },
      text: { type: String }
    }
  ],
  title: { type: String, default: '' }, // Auto-generated from first user message
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
