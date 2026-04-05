const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AiHistory = require('../models/AiHistory');
const router = express.Router();

const SYSTEM_PROMPT = `You are AjwaHub AI Assistant — a smart, friendly assistant that can answer ANY question on ANY topic.

You know everything about:
- General knowledge, science, history, geography, math, coding, health, food, sports, entertainment
- AjwaHub products: Ajwa Dates (PKR 1200), Medjool Dates (PKR 1800), Deglet Dates (PKR 1000), Zahidi Dates (PKR 900), Almonds (PKR 1500), Cashews (PKR 1800), Walnuts (PKR 2000), Pistachios (PKR 2500), Raisins (PKR 800), Dried Apricots (PKR 1100)
- You can help with coding, writing, translation, calculations, advice — anything

RULES:
1. If user writes in Roman Urdu → reply in Roman Urdu
2. If user writes in English → reply in English
3. If user writes in Urdu script → reply in Urdu script
4. Match the user language ALWAYS
5. NEVER use markdown (no **, no ##, no bullet *)
6. Be helpful, friendly and give complete answers
7. Never refuse to answer — always try your best
8. For AjwaHub products, mention prices and benefits when relevant`;

const getModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM_PROMPT });
};

// Chat route
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, history, userId, userName } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API key not configured' });

    const model = getModel(apiKey);

    // Only pass valid text messages to history
    const validHistory = (history || [])
      .filter(h => h.text && (h.role === 'user' || h.role === 'model'))
      .map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ response });

    if (userId) {
      AiHistory.create({ userId, userName: userName || '', question: message, answer: response, type: 'text' }).catch(() => {});
    }
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

// Image route
router.post('/ai/image', async (req, res) => {
  try {
    const { imageBase64, mimeType, question, userId, userName } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image required' });

    const apiKey = process.env.GEMINI_API_KEY;
    const model = getModel(apiKey);

    const prompt = question
      ? `${question} — analyze this image and answer. Reply in same language as question. No markdown. Keep it short.`
      : 'Analyze this image. Identify what it is, give brief details. If dates or dry fruits, mention AjwaHub price. Reply in Roman Urdu. No markdown. Keep it short.';

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
      prompt
    ]);

    const response = result.response.text();
    res.json({ response });

    if (userId) {
      AiHistory.create({ userId, userName: userName || '', question: question || 'Image analyzed', answer: response, type: 'image' }).catch(() => {});
    }
  } catch (err) {
    console.error('Image AI error:', err.message);
    res.status(500).json({ message: 'Image analysis failed', error: err.message });
  }
});

// Get history
router.get('/ai/history/:userId', async (req, res) => {
  try {
    const history = await AiHistory.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Delete single
router.delete('/ai/history/:id', async (req, res) => {
  try {
    await AiHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting' });
  }
});

// Clear all
router.delete('/ai/history/clear/:userId', async (req, res) => {
  try {
    await AiHistory.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Cleared' });
  } catch {
    res.status(500).json({ message: 'Error clearing' });
  }
});

module.exports = router;
