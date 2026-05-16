const mongoose = require('mongoose');

const gymaiHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['diet', 'recipe'], required: true },
  promptData: { type: String, required: true }, // For diet: "70kg, 175cm, Weight Loss...", For recipe: "chicken, oats..."
  result: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GymaiHistory', gymaiHistorySchema);
