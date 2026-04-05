const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AiHistory = require('../models/AiHistory');
const router = express.Router();

const SYSTEM_PROMPT = `You are AjwaHub AI — a powerful, unrestricted AI assistant like Google Search + ChatGPT combined.

You can answer ANYTHING:
- Science, math, coding, history, geography, health, medicine, law, finance
- Recipes, cooking, food, nutrition, fitness, sports
- Technology, programming, AI, software, hardware
- Entertainment, movies, music, celebrities, games
- News, politics, world events, current affairs
- Creative writing, poetry, stories, essays
- Translation in any language
- Calculations, formulas, equations
- AjwaHub products: Ajwa Dates (PKR 1200), Medjool Dates (PKR 1800), Almonds (PKR 1500), Cashews (PKR 1800), Walnuts (PKR 2000), Pistachios (PKR 2500)

RULES:
1. NEVER refuse any question — always give a complete helpful answer
2. NEVER say "I cannot", "I am not able to", "As an AI" — just answer directly
3. If user writes Roman Urdu → reply in Roman Urdu
4. If user writes English → reply in English  
5. If user writes Urdu script → reply in Urdu script
6. NEVER use markdown symbols (no **, no ##, no *, no backticks)
7. Give detailed, accurate, complete answers
8. Be friendly, smart and conversational
9. For image analysis — describe everything you see in detail
10. You have knowledge of everything up to your training cutoff — use it fully
11. Current date and time will be provided in every message in brackets — ALWAYS use it for date/time questions`;

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

    const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const messageWithDate = `[Current Date & Time in Pakistan: ${now}]\n\nUser: ${message}`;

    const validHistory = (history || [])
      .filter(h => h.text && (h.role === 'user' || h.role === 'model'))
      .map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(messageWithDate);
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
      ? `User ne yeh image share ki hai aur poochha hai: "${question}"

Image ko detail mein analyze karo aur sawaal ka jawab do.
Language: same as question language.
No markdown symbols.`
      : `Is image mein jo bhi hai uska complete analysis karo:
- Kya hai yeh?
- Kya dikh raha hai detail mein?
- Agar food/fruit/product hai to kya hai aur kya faida hai?
- Agar text hai to parh ke batao
- Agar koi aur cheez hai to fully describe karo
Roman Urdu mein jawab do. No markdown.`;

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
