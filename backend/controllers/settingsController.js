/**
 * Settings Controller
 * Admin manages app-wide settings
 */
const Settings = require('../models/Settings');

// GET /api/settings/public - Public settings (membership fee, etc.)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.find({ group: { $in: ['membership', 'general'] } });
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

// GET /api/settings - All settings (admin)
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

// PUT /api/settings - Update settings (admin)
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const promises = Object.entries(updates).map(([key, value]) =>
      Settings.set(key, value)
    );
    await Promise.all(promises);
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};
