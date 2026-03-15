const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/materialController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', optionalAuth, ctrl.getMaterials);
router.get('/categories', ctrl.getCategories);
router.get('/:id', optionalAuth, ctrl.getMaterial);
router.post('/:id/download', protect, ctrl.downloadMaterial);

// Admin only
router.post('/', protect, adminOnly, upload.single('file'), ctrl.uploadMaterial);
router.put('/:id', protect, adminOnly, ctrl.updateMaterial);
router.delete('/:id', protect, adminOnly, ctrl.deleteMaterial);

module.exports = router;
