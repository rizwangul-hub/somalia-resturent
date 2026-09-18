const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings — Create new table booking request
router.post('/', bookingController.createBooking);

// GET /api/bookings/:id — Retrieve booking by ID or bookingNumber
router.get('/:id', bookingController.getBookingById);

module.exports = router;
