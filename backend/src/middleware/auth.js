const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET =
  process.env.JWT_SECRET || 'aflax_restaurant_secure_jwt_secret_2026_degmada_yaqshiid';

/**
 * Authentication middleware to protect administrative endpoints.
 * Requires a valid Bearer token in the Authorization header.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login as admin.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please login again.',
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authentication token.',
      });
    }

    // Verify admin existence and active status in MongoDB
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account no longer exists.',
      });
    }

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated.',
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  JWT_SECRET,
};
