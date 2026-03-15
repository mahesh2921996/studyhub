/**
 * File Upload Middleware
 * Configures multer for local storage.
 * ─────────────────────────────────────
 * TO SWITCH TO CLOUD STORAGE:
 * Replace the storage engine below with multer-s3 or multer-cloudinary.
 * Keep the same fileFilter and limits.
 * ─────────────────────────────────────
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const createDirs = () => {
  const dirs = ['pdfs', 'images', 'videos'].map(d =>
    path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads', d)
  );
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};
createDirs();

// ─── LOCAL STORAGE CONFIG ────────────────────────────────────────────────────
// CLOUD SWITCH: Replace this diskStorage block with your cloud storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const typeMap = {
      'application/pdf': 'pdfs',
      'image/jpeg': 'images',
      'image/png': 'images',
      'image/gif': 'images',
      'image/webp': 'images',
      'video/mp4': 'videos',
      'video/webm': 'videos',
      'video/ogg': 'videos'
    };
    const subDir = typeMap[file.mimetype] || 'misc';
    const uploadPath = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads', subDir);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // UUID filename to prevent collisions and enumeration
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// File type filter - only allow specific types
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed: PDF, images, videos.`), false);
  }
};

// Determine fileType for DB from mimetype
exports.getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'other';
};

// Export configured multer instance
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 1 // One file per request
  }
});
