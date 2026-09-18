const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const categoryRoutes = require('./categoryRoutes');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');
const settingsRoutes = require('./settingsRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;



