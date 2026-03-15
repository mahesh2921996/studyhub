// /**
//  * File Upload Middleware
//  * Configures multer for local storage.
//  * ─────────────────────────────────────
//  * TO SWITCH TO CLOUD STORAGE:
//  * Replace the storage engine below with multer-s3 or multer-cloudinary.
//  * Keep the same fileFilter and limits.
//  * ─────────────────────────────────────
//  */
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// // Ensure upload directories exist
// const createDirs = () => {
//   const dirs = ['pdfs', 'images', 'videos'].map(d =>
//     path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads', d)
//   );
//   dirs.forEach(dir => {
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//   });
// };
// createDirs();

// // ─── LOCAL STORAGE CONFIG ────────────────────────────────────────────────────
// // CLOUD SWITCH: Replace this diskStorage block with your cloud storage engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const typeMap = {
//       'application/pdf': 'pdfs',
//       'image/jpeg': 'images',
//       'image/png': 'images',
//       'image/gif': 'images',
//       'image/webp': 'images',
//       'video/mp4': 'videos',
//       'video/webm': 'videos',
//       'video/ogg': 'videos'
//     };
//     const subDir = typeMap[file.mimetype] || 'misc';
//     const uploadPath = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads', subDir);
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // UUID filename to prevent collisions and enumeration
//     const ext = path.extname(file.originalname).toLowerCase();
//     const uniqueName = `${uuidv4()}${ext}`;
//     cb(null, uniqueName);
//   }
// });

// // File type filter - only allow specific types
// const fileFilter = (req, file, cb) => {
//   const allowed = [
//     'application/pdf',
//     'image/jpeg', 'image/png', 'image/gif', 'image/webp',
//     'video/mp4', 'video/webm', 'video/ogg'
//   ];
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`File type ${file.mimetype} not allowed. Allowed: PDF, images, videos.`), false);
//   }
// };

// // Determine fileType for DB from mimetype
// exports.getFileType = (mimetype) => {
//   if (mimetype === 'application/pdf') return 'pdf';
//   if (mimetype.startsWith('image/')) return 'image';
//   if (mimetype.startsWith('video/')) return 'video';
//   return 'other';
// };

// // Export configured multer instance
// exports.upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 500 * 1024 * 1024, // 500MB max file size
//     files: 1 // One file per request
//   }
// });


/**
 * File Upload Middleware
 * Uses Cloudinary for cloud storage
 * ─────────────────────────────────────
 * ⚠️ Set these in .env:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// ⚠️ Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'studyhub/misc';
    let resource_type = 'auto';

    if (file.mimetype === 'application/pdf') {
      folder = 'studyhub/pdfs';
      resource_type = 'raw'; // PDFs must use raw
    } else if (file.mimetype.startsWith('image/')) {
      folder = 'studyhub/images';
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'studyhub/videos';
      resource_type = 'video';
    }

    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg']
    };
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed.`), false);
  }
};

// Determine fileType for DB
exports.getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'other';
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  }
});