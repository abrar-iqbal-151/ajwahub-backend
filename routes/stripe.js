const express = require('express');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  res.status(503).json({ error: 'Stripe not configured' });
});

module.exports = router;
