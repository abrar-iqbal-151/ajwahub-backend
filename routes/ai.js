const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AiHistory = require('../models/AiHistory');
const ChatSession = require('../models/ChatSession');
const router = express.Router();

const SYSTEM_PROMPT = `You are AjwaHub AI — a highly specialized WORLDWIDE EXPERT AI assistant for AjwaHub.

CRITICAL RULES FOR EVERY RESPONSE:
1. STRICT TOPIC LIMITATION: You are ONLY allowed to discuss, answer, or analyze topics related to Dates (Khajoor), Dry Fruits, Nuts (almonds, cashews, walnuts, pistachios, etc.), their health benefits, farming, markets, and AjwaHub products.
2. GLOBAL EXPERT KNOWLEDGE: If the user asks about WORLDWIDE prices, rates, markets, or qualities of Dates/Dry fruits (e.g. "What is the rate of Ajwa in Pakistan or Afghanistan?", "Where are the best pistachios grown?"), YOU MUST PROVIDE FACTUAL, ACCURATE, AND DETAILED WORLDWIDE ANSWERS based on your full global dataset. Do NOT say "I only know about AjwaHub". You are a global expert on dry fruits/dates. Give correct global answers while politely mentioning AjwaHub's premium options if relevant.
3. REFUSAL PROTOCOL: If the user asks ANY question or uploads ANY image completely OUTSIDE the topic of dates/dry fruits (e.g. coding, math, general knowledge, politics, sports, animals, random objects, etc.), YOU MUST INSTANTLY REFUSE to answer.
   Say exactly: "Main sirf Khajoor aur Dry Fruits ke baaray mein baat kar sakta hoon. Maazrat chahta hoon, is baaray mein jawab nahi de sakta."
4. IN-DEPTH RESEARCH: For allowed topics (Dates, Dry Fruits), provide VERY DETAILED, well-researched, and complete answers. Give comprehensive facts, benefits, and deep analysis. Do not give short answers; give full, rich details.
5. IMAGE ANALYSIS: If an image is uploaded, FIRST check if it contains Dates or Dry Fruits. If it does NOT, refuse immediately using the protocol above. If it does, analyze the quality, freshness, and details of the dates/dry fruits thoroughly.
6. NO MARKDOWN: NEVER use markdown symbols (no **, no ##, no *, no backticks). Provide plain text formatted cleanly.
7. LANGUAGE MATCHING: Reply in the exact same language the user writes in (Roman Urdu, Urdu script, or English).`;

const getModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-flash-latest for significantly faster response times
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
};

// Chat route
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, history, userId, userName, language } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API key not configured' });

    const model = getModel(apiKey);

    const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const validHistory = (history || [])
      .filter(h => h.text && (h.role === 'user' || h.role === 'model'))
      .map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const langInstruction = language === 'English'
      ? "8. LANGUAGE MANDATE: You MUST reply STRICTLY in ENGLISH, regardless of the language the user types in."
      : "8. LANGUAGE MANDATE: You MUST reply STRICTLY in the exact Urdu script (اردو رسم الخط), NOT Roman Urdu. You must write in actual Pakistani Urdu alphabet letters (e.g. السلام علیکم، آپ کیسے ہیں؟). Do not use English alphabet for Urdu.";

    // Inject system prompt as first history message
    const fullHistory = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + langInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I will follow all these instructions and strictly use the requested language.' }] },
      ...validHistory
    ];

    const chat = model.startChat({ history: fullHistory });
    const result = await chat.sendMessage(`[Current Date & Time in Pakistan: ${now}]\n\n${message}`);
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

// Dedicated GymAI Diet/Recipe Generation Route
router.post('/ai/gymai/generate', async (req, res) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API key not configured' });

    const model = getModel(apiKey);
    
    const langInstruction = language === 'English' 
      ? 'STRICTLY in clear ENGLISH.' 
      : 'STRICTLY in the exact Urdu script (اردو رسم الخط) using Arabic/Urdu alphabets (e.g. آپ کا ڈائٹ پلان...). DO NOT use Roman Urdu.';

    const gymAiSystemPrompt = `You are GymAI, an expert nutritionist and fitness coach representing AjwaHub. Your job is to create detailed, healthy diet plans and recipes based strictly on the user's bodily stats. 
Whenever possible or relevant, creatively incorporate Ajwa dates or premium dry fruits into the meals. 
Write the entire response ${langInstruction}
IMPORTANT: DO NOT use any markdown symbols (no **, no ##, no *). Use simple bullet points (-) and spacing.
Be extremely practical, safe, and professional about health.`;

    const fullHistory = [
      { role: 'user', parts: [{ text: gymAiSystemPrompt }] },
      { role: 'model', parts: [{ text: `Understood. I will act as GymAI and provide safe, practical diet plans and recipes without any markdown symbols, strictly in ${language === 'English' ? 'English' : 'Urdu script (اردو)'}.` }] },
    ];

    const chat = model.startChat({ history: fullHistory });
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    res.json({ response });
  } catch (err) {
    console.error('GymAI generation error:', err.message);
    res.status(500).json({ message: 'GymAI error', error: err.message });
  }
});

// Image route
router.post('/ai/image', async (req, res) => {
  try {
    const { imageBase64, mimeType, question, userId, userName, language } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image required' });

    const apiKey = process.env.GEMINI_API_KEY;
    const model = getModel(apiKey);

    const langInstruction = language === 'English' ? 'STRICTLY in ENGLISH' : 'STRICTLY in the exact Urdu script (اردو رسم الخط). DO NOT use Roman Urdu';

    const systemPrompt = `${SYSTEM_PROMPT}\n\nUser ne image share ki hai.`;
    const prompt = question
      ? `${systemPrompt}\n\nUser ka sawaal: "${question}"\n\nImage ko detail mein analyze karo aur sawaal ka IN-DEPTH, FULL RESEARCHED jawab do (ONLY IF it is about dates/dry fruits, otherwise strictly refuse). No markdown symbols. Reply ${langInstruction}.`
      : `${systemPrompt}\n\nIs image mein jo bhi hai uska complete aur IN-DEPTH research analysis karo:\n- Kya hai yeh?\n- Quality, freshness aur details kaisi hain?\n- Health benefits kya hain?\nAGAR YEH DATES YA DRY FRUITS NAHI HAIN TO STRICTLY REFUSE KARDO aur kaho ke main sirf dry fruits check karta hoon.\nReply ${langInstruction}. No markdown.`;

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

// Compare Images route
router.post('/ai/compare-images', async (req, res) => {
  try {
    const { image1Base64, mimeType1, image2Base64, mimeType2, question } = req.body;
    if (!image1Base64 || !image2Base64) return res.status(400).json({ message: 'Both images are required' });

    const apiKey = process.env.GEMINI_API_KEY;
    const model = getModel(apiKey);

    const prompt = question || "Mera yeh sawal hai: In dono Ajwa khajooron mein farq batao. Kaun si achi hai aur kaun si kharab? Kya farq hai dono ki quality aur appearance mein? Urdu script (اردو رسم الخط) mein clearly jawab do. DO NOT use Roman Urdu.";

    const result = await model.generateContent([
      { inlineData: { data: image1Base64, mimeType: mimeType1 || 'image/jpeg' } },
      { inlineData: { data: image2Base64, mimeType: mimeType2 || 'image/jpeg' } },
      prompt
    ]);

    const response = result.response.text();
    res.json({ response });

  } catch (err) {
    console.error('Compare AI error:', err.message);
    res.status(500).json({ message: 'Image comparison failed', error: err.message });
  }
});

router.get('/ai/history/:userId', async (req, res) => {
  try {
    const history = await AiHistory.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

router.delete('/ai/history/:id', async (req, res) => {
  try {
    await AiHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting' });
  }
});

router.delete('/ai/history/clear/:userId', async (req, res) => {
  try {
    await AiHistory.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Cleared' });
  } catch {
    res.status(500).json({ message: 'Error clearing' });
  }
});

// ── CHAT SESSIONS (Full conversation save) ──

// Save a full chat session (called when user clicks "New Chat")
router.post('/ai/session', async (req, res) => {
  try {
    const { userId, userName, messages } = req.body;
    if (!userId || !messages || messages.length < 2) {
      return res.status(400).json({ message: 'Invalid session data' });
    }
    // Auto-generate title from first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg?.text?.slice(0, 60) || 'Chat Session';
    const session = await ChatSession.create({ userId, userName: userName || '', messages, title });
    res.json({ session });
  } catch (err) {
    console.error('Save session error:', err.message);
    res.status(500).json({ message: 'Error saving session' });
  }
});

// Get all sessions for a user
router.get('/ai/sessions/:userId', async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(sessions);
  } catch {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Delete a single session
router.delete('/ai/session/:id', async (req, res) => {
  try {
    await ChatSession.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting session' });
  }
});

// Clear ALL sessions for a user
router.delete('/ai/sessions/clear/:userId', async (req, res) => {
  try {
    await ChatSession.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All sessions cleared' });
  } catch {
    res.status(500).json({ message: 'Error clearing sessions' });
  }
});

module.exports = router;
