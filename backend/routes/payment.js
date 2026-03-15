const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', ctrl.getConfig);
router.post('/create-order', protect, ctrl.createOrder);
router.post('/verify', protect, ctrl.verifyPayment);
// Stripe webhook needs raw body
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

module.exports = router;
