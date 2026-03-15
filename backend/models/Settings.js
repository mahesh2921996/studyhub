/**
 * Settings Model
 * Global app settings managed by admin
 */
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  label: { type: String },
  group: { type: String, default: 'general' }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

// Helper to get a setting value
Settings.get = async (key, defaultValue = null) => {
  const setting = await Settings.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Helper to set a setting value
Settings.set = async (key, value, label = '', group = 'general') => {
  return Settings.findOneAndUpdate(
    { key },
    { key, value, label, group },
    { upsert: true, new: true }
  );
};

module.exports = Settings;
