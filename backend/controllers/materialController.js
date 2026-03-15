/**
 * Materials Controller
 * CRUD for study materials
 */
const Material = require('../models/Material');
const { upload, getFileType } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/materials - List materials (with search/filter)
exports.getMaterials = async (req, res) => {
  try {
    const { search, category, type, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    // Access control: non-members/guests see all but members-only content is flagged
    // We return metadata for all, but restrict file URLs for members-only

    if (category) filter.category = new RegExp(category, 'i');
    if (type && ['pdf', 'image', 'video'].includes(type)) filter.fileType = type;

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const total = await Material.countDocuments(filter);
    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Determine user's access level
    const userRole = req.user?.role;
    const userIsMember = req.user?.hasMembership?.() || false;
    const hasFullAccess = userRole === 'admin' || userIsMember;

    // Sanitize response: hide file URLs for members-only if user doesn't have access
    const sanitized = materials.map(m => {
      const item = { ...m };
      if (m.accessType === 'members_only' && !hasFullAccess) {
        delete item.filePath;
        item.fileUrl = null; // Signal frontend to show "become a member"
      }
      return item;
    });

    res.json({
      success: true,
      data: sanitized,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Get materials error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
};

// GET /api/materials/:id
exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('uploadedBy', 'name');
    if (!material || !material.isActive) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    const userRole = req.user?.role;
    const userIsMember = req.user?.hasMembership?.() || false;
    const hasFullAccess = userRole === 'admin' || userIsMember;

    if (material.accessType === 'members_only' && !hasFullAccess) {
      // Return metadata only
      const preview = material.toJSON();
      delete preview.filePath;
      preview.fileUrl = null;
      preview.accessRestricted = true;
      return res.json({ success: true, data: preview });
    }

    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch material.' });
  }
};

// POST /api/materials - Upload new material (admin only)
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, description, category, subject, accessType, downloadAllowed, tags } = req.body;

    if (!title || !category) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    const fileType = getFileType(req.file.mimetype);

    // Cloudinary returns path as the full URL
    const fileUrl = req.file.path;
    const fileName = req.file.filename || req.file.public_id;

    const material = await Material.create({
      title,
      description,
      category,
      subject,
      fileType,
      fileName,
      originalName: req.file.originalname,
      filePath: fileUrl,   // Cloudinary URL stored here
      fileSize: req.file.size || 0,
      mimeType: req.file.mimetype,
      accessType: accessType || 'free',
      downloadAllowed: downloadAllowed !== 'false',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedBy: req.user.id
    });

    // const fileType = getFileType(req.file.mimetype);
    // const fileName = req.file.filename;

    // const material = await Material.create({
    //   title,
    //   description,
    //   category,
    //   subject,
    //   fileType,
    //   fileName,
    //   originalName: req.file.originalname,
    //   filePath: req.file.path,
    //   fileSize: req.file.size,
    //   mimeType: req.file.mimetype,
    //   accessType: accessType || 'free',
    //   downloadAllowed: downloadAllowed !== 'false',
    //   tags: tags ? tags.split(',').map(t => t.trim()) : [],
    //   uploadedBy: req.user.id
    // });

    res.status(201).json({ success: true, message: 'Material uploaded successfully!', data: material });
  } catch (err) {
    console.error('Upload error:', err);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
  }
};

// PUT /api/materials/:id - Edit material (admin only)
exports.updateMaterial = async (req, res) => {
  try {
    const { title, description, category, subject, accessType, downloadAllowed, tags, isActive } = req.body;
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { title, description, category, subject, accessType, downloadAllowed, tags: tags?.split(',').map(t => t.trim()), isActive },
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });
    res.json({ success: true, message: 'Material updated.', data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

// DELETE /api/materials/:id - Delete material (admin only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    // Delete file from disk
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

// GET /api/materials/categories - Get all unique categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Material.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// POST /api/materials/:id/download - Track download
exports.downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    // Check download permission
    if (!material.downloadAllowed) {
      return res.status(403).json({ success: false, message: 'Download not allowed for this material.' });
    }

    // Check access
    const userRole = req.user?.role;
    const userIsMember = req.user?.hasMembership?.() || false;
    const hasAccess = userRole === 'admin' || userIsMember || material.accessType === 'free';

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Membership required to download.' });
    }

    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    material.downloadCount += 1;
    await material.save();

    res.download(material.filePath, material.originalName);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Download failed.' });
  }
};
