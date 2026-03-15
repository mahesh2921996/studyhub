/**
 * Payment Model
 * Records of membership payments
 */
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  gateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual'],
    required: true
  },
  gatewayPaymentId: String,
  gatewayOrderId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  membershipDuration: {
    type: Number, // days, 0 = lifetime
    default: 365
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
