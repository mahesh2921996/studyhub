/**
 * File Access Middleware
 * Controls who can access uploaded files
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Material = require('../models/Material');
const path = require('path');

module.exports = async (req, res, next) => {
  try {
    const requestedFile = path.basename(req.path);

    // Find the material by filename
    const material = await Material.findOne({ fileName: requestedFile });

    // If material not found in DB, deny access
    if (!material) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // Free materials are accessible to everyone
    if (material.accessType === 'free') {
      material.viewCount += 1;
      await material.save();
      return next();
    }

    // Members-only: require auth
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Also check query param token (for video streaming in <video> tags)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required to access this file.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Admins always have access
    if (user.role === 'admin') {
      return next();
    }

    // Check membership
    if (!user.hasMembership()) {
      return res.status(403).json({ success: false, message: 'Active membership required.' });
    }

    material.viewCount += 1;
    await material.save();
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    console.error('File access middleware error:', err);
    next(); // Don't block on errors, let static middleware handle
  }
};
