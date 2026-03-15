/**
 * User Model
 * Handles both admin and student accounts
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isMember: {
    type: Boolean,
    default: false
  },
  membershipExpiry: {
    type: Date,
    default: null
  },
  membershipPaymentId: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if membership is active
userSchema.methods.hasMembership = function() {
  if (!this.isMember) return false;
  if (!this.membershipExpiry) return true; // Lifetime membership
  return new Date() < new Date(this.membershipExpiry);
};

// Virtual for membership status
userSchema.virtual('membershipStatus').get(function() {
  if (this.role === 'admin') return 'admin';
  if (!this.isMember) return 'free';
  if (this.membershipExpiry && new Date() > new Date(this.membershipExpiry)) return 'expired';
  return 'member';
});

module.exports = mongoose.model('User', userSchema);
