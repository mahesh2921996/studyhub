const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All admin routes protected

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getUsers);
router.put('/users/:id/toggle', ctrl.toggleUser);
router.put('/users/:id/membership', ctrl.updateMembership);

module.exports = router;
