/**
 * Database Seeder
 * Creates default admin user and settings on first run
 */
const User = require('../models/User');
const Settings = require('../models/Settings');

module.exports = async () => {
  try {
    // ─── Create default admin if none exists ──────────────────────────
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@studyhub.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isMember: true
      });
      console.log('✅ Default admin created:');
      console.log(`   Email:    ${process.env.ADMIN_EMAIL || 'admin@studyhub.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
      console.log('   ⚠️  Change this password immediately in production!');
    }

    // ─── Default settings ─────────────────────────────────────────────
    const defaults = [
      { key: 'site_name', value: 'StudyHub', label: 'Site Name', group: 'general' },
      { key: 'site_tagline', value: 'Learn Better. Study Smarter.', label: 'Tagline', group: 'general' },
      { key: 'membership_fee', value: 499, label: 'Membership Fee (₹)', group: 'membership' },
      { key: 'membership_currency', value: 'INR', label: 'Currency', group: 'membership' },
      { key: 'membership_duration', value: 365, label: 'Membership Duration (days)', group: 'membership' },
      { key: 'payment_gateway', value: 'razorpay', label: 'Active Payment Gateway', group: 'payment' },
    ];

    for (const setting of defaults) {
      const exists = await Settings.findOne({ key: setting.key });
      if (!exists) {
        await Settings.create(setting);
      }
    }

    console.log('✅ Default settings initialized');
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};
