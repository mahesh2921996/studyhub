/**
 * Admin Controller
 * Dashboard stats and user management
 */
const User = require('../models/User');
const Material = require('../models/Material');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalMembers, totalMaterials, totalPayments, recentPayments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ isMember: true, role: 'student' }),
      Material.countDocuments({ isActive: true }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMembers,
        totalMaterials,
        totalRevenue: totalPayments[0]?.total || 0,
        recentPayments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'student' };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// PUT /api/admin/users/:id/toggle - Toggle user active status
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

// PUT /api/admin/users/:id/membership - Manually grant/revoke membership
exports.updateMembership = async (req, res) => {
  try {
    const { isMember, membershipExpiry } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isMember, membershipExpiry: isMember ? membershipExpiry : null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'Membership updated.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};
