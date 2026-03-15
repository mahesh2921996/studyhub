/**
 * Payment Controller
 * ──────────────────────────────────────────────────────────────────
 * ⚠️  PAYMENT GATEWAY SETUP ⚠️
 * 
 * STRIPE:
 *   1. Create account at https://stripe.com
 *   2. Get keys from https://dashboard.stripe.com/apikeys
 *   3. Set STRIPE_SECRET_KEY in .env
 *   4. Set STRIPE_WEBHOOK_SECRET in .env (from Stripe webhook settings)
 * 
 * RAZORPAY:
 *   1. Create account at https://razorpay.com
 *   2. Get keys from https://dashboard.razorpay.com/app/keys
 *   3. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 * ──────────────────────────────────────────────────────────────────
 */
const User = require('../models/User');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

// ─── STRIPE ───────────────────────────────────────────────────────────────────
// ⚠️ INSERT STRIPE SECRET KEY in .env as STRIPE_SECRET_KEY
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null; // Will be null until key is configured

// ─── RAZORPAY ─────────────────────────────────────────────────────────────────
// ⚠️ INSERT RAZORPAY KEYS in .env as RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay'); // npm install razorpay if using
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// GET /api/payment/config - Get payment config for frontend
exports.getConfig = async (req, res) => {
  try {
    const membershipFee = await Settings.get('membership_fee', 499);
    const currency = await Settings.get('membership_currency', 'INR');
    const activeGateway = await Settings.get('payment_gateway', 'razorpay');
    const membershipDuration = await Settings.get('membership_duration', 365);

    res.json({
      success: true,
      data: {
        membershipFee,
        currency,
        activeGateway,
        membershipDuration,
        // ⚠️ RAZORPAY: Public key sent to frontend
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        // ⚠️ STRIPE: Publishable key sent to frontend (add STRIPE_PUBLISHABLE_KEY to .env)
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get payment config.' });
  }
};

// POST /api/payment/create-order - Create payment order
exports.createOrder = async (req, res) => {
  try {
    const { gateway } = req.body;
    const membershipFee = await Settings.get('membership_fee', 499);
    const currency = await Settings.get('membership_currency', 'INR');
    const activeGateway = gateway || await Settings.get('payment_gateway', 'razorpay');

    if (activeGateway === 'razorpay') {
      // ⚠️ RAZORPAY ORDER CREATION
      if (!razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
        });
      }

      const order = await razorpay.orders.create({
        amount: membershipFee * 100, // Razorpay uses paise (1 INR = 100 paise)
        currency: currency,
        receipt: `studyhub_${req.user.id}_${Date.now()}`
      });

      // Save pending payment
      const payment = await Payment.create({
        user: req.user.id,
        amount: membershipFee,
        currency,
        gateway: 'razorpay',
        gatewayOrderId: order.id,
        status: 'pending'
      });

      return res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          paymentDbId: payment._id
        }
      });
    }

    if (activeGateway === 'stripe') {
      // ⚠️ STRIPE PAYMENT INTENT
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: 'Stripe not configured. Please add STRIPE_SECRET_KEY to .env'
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: membershipFee * 100, // Stripe uses smallest currency unit
        currency: currency.toLowerCase(),
        metadata: { userId: req.user.id.toString() }
      });

      const payment = await Payment.create({
        user: req.user.id,
        amount: membershipFee,
        currency,
        gateway: 'stripe',
        gatewayPaymentId: paymentIntent.id,
        status: 'pending'
      });

      return res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentDbId: payment._id
        }
      });
    }

    res.status(400).json({ success: false, message: 'Invalid payment gateway.' });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

// POST /api/payment/verify - Verify & activate membership
exports.verifyPayment = async (req, res) => {
  try {
    const { gateway, razorpayPaymentId, razorpayOrderId, razorpaySignature, stripePaymentIntentId, paymentDbId } = req.body;

    if (gateway === 'razorpay') {
      // ⚠️ RAZORPAY SIGNATURE VERIFICATION
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
      }
    }

    if (gateway === 'stripe') {
      // ⚠️ STRIPE: Verify payment intent status
      if (!stripe) {
        return res.status(503).json({ success: false, message: 'Stripe not configured.' });
      }
      const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment not completed.' });
      }
    }

    // Update payment record
    const membershipDuration = await Settings.get('membership_duration', 365);
    await Payment.findByIdAndUpdate(paymentDbId, {
      status: 'completed',
      gatewayPaymentId: razorpayPaymentId || stripePaymentIntentId
    });

    // Activate membership
    const expiryDate = membershipDuration === 0
      ? null
      : new Date(Date.now() + membershipDuration * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(req.user.id, {
      isMember: true,
      membershipExpiry: expiryDate,
      membershipPaymentId: paymentDbId
    });

    res.json({ success: true, message: 'Membership activated successfully! Welcome aboard 🎉' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

// POST /api/payment/webhook/stripe - Stripe webhook handler
exports.stripeWebhook = async (req, res) => {
  // ⚠️ STRIPE WEBHOOK: Set STRIPE_WEBHOOK_SECRET in .env
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const membershipDuration = await Settings.get('membership_duration', 365);
    const expiryDate = membershipDuration === 0 ? null : new Date(Date.now() + membershipDuration * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(userId, { isMember: true, membershipExpiry: expiryDate });
  }

  res.json({ received: true });
};
