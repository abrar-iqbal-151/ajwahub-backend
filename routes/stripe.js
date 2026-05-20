const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/stripe/create-payment-intent
 * Body: { amount (PKR integer), currency, orderId, userEmail }
 * Returns: { clientSecret }
 *
 * Stripe minimum: ~$0.50 USD = ~Rs140 PKR at current rates.
 * We charge in USD (converting from PKR) to ensure broad test-mode compatibility.
 * PKR → USD rate used: 1 USD = 280 PKR (update as needed).
 */
const PKR_TO_USD_RATE = 280; // 1 USD = 280 PKR
const STRIPE_MIN_PKR = 150;  // minimum PKR to safely exceed $0.50 minimum

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderId, userEmail } = req.body;

    const amountPKR = Math.round(Number(amount));

    if (!amountPKR || isNaN(amountPKR) || amountPKR <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }

    if (amountPKR < STRIPE_MIN_PKR) {
      return res.status(400).json({
        error: `Minimum order amount for card payment is PKR ${STRIPE_MIN_PKR}. Your total is PKR ${amountPKR}.`
      });
    }

    // Convert PKR → USD cents for Stripe
    const amountUSDCents = Math.round((amountPKR / PKR_TO_USD_RATE) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountUSDCents,      // Stripe wants cents
      currency: 'usd',             // Use USD for max compatibility
      metadata: {
        orderId:    orderId    || '',
        userEmail:  userEmail  || '',
        amountPKR:  String(amountPKR),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amountUSDCents,
      amountPKR,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/stripe/confirm-payment
 * Body: { paymentIntentId }
 * Returns status of the PaymentIntent (for server-side verification)
 */
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId required' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({ status: paymentIntent.status, amount: paymentIntent.amount });
  } catch (err) {
    console.error('Stripe confirm error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
