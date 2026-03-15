// routes/settings.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', ctrl.getPublicSettings);
router.get('/', protect, adminOnly, ctrl.getAllSettings);
router.put('/', protect, adminOnly, ctrl.updateSettings);

module.exports = router;
