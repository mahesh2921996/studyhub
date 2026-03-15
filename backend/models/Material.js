/**
 * Material Model
 * Study material metadata (files stored separately)
 */
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'video'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // bytes
    default: 0
  },
  mimeType: {
    type: String
  },
  // Access control
  accessType: {
    type: String,
    enum: ['free', 'members_only'],
    default: 'free'
  },
  downloadAllowed: {
    type: Boolean,
    default: true
  },
  // Thumbnail for videos/images
  thumbnail: {
    type: String,
    default: null
  },
  // Tags for search
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  // Stats
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  // Admin control
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Text index for search
materialSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });
materialSchema.index({ category: 1, fileType: 1, accessType: 1 });

// Virtual for file URL
materialSchema.virtual('fileUrl').get(function() {
  return `/uploads/${this.fileType}s/${this.fileName}`;
});

materialSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Material', materialSchema);
