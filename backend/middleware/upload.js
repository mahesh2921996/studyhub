/**
 * File Upload Middleware — Supabase Storage
 * ⚠️ Set in .env:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET
 */
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || 'studyhub-files';

// Use memory storage — file goes to buffer then uploads to Supabase
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Use PDF, image, or video.'), false);
  }
};

exports.getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'other';
};

// Upload file buffer to Supabase Storage
exports.uploadToSupabase = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const fileType = exports.getFileType(file.mimetype);
  const folder = `${fileType}s`; // pdfs, images, videos
  const fileName = `${folder}/${uuidv4()}${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return {
    fileName,
    fileUrl: urlData.publicUrl
  };
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});