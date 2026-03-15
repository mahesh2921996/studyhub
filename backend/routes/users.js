// routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');

// GET /api/users/payments - Current user's payment history
router.get('/payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

module.exports = router;
