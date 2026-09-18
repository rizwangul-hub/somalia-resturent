const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const RestaurantSettings = require('../models/RestaurantSettings');
const { getNextBookingNumber } = require('../utils/bookingNumber');
const {
  formatBookingDate,
  formatBookingTime,
  generateBookingWhatsAppMessage,
  generateBookingWhatsAppUrl,
} = require('../utils/whatsapp');

/**
 * Create a new table booking request
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  try {
    const { customerName, phone, date, time, numberOfGuests, notes } = req.body || {};

    // 1. Customer Name Validation
    const name = customerName ? String(customerName).trim() : '';
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          'Fadlan geli magacaaga oo buuxa (ugu yaraan 2 xaraf) / Customer name must be at least 2 characters',
      });
    }
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          'Magaca macaamiilku ma dhaafi karo 100 xaraf / Customer name cannot exceed 100 characters',
      });
    }

    // 2. Phone Validation
    const rawPhone = phone ? String(phone).trim() : '';
    const cleanPhone = rawPhone.replace(/[\s-+()]/g, '');
    if (!rawPhone || cleanPhone.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Fadlan geli lambar telefoon oo sax ah (ugu yaraan 6 lambar) / Valid customer phone is required',
      });
    }
    if (rawPhone.length > 25) {
      return res.status(400).json({
        success: false,
        message:
          'Lambarka telefoonku ma dhaafi karo 25 xaraf / Phone number cannot exceed 25 characters',
      });
    }

    // 3. Date Validation & Past Date Rejection
    const rawDate = date ? String(date).trim() : '';
    if (!rawDate) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan dooro taariikhda ballanta / Booking date is required',
      });
    }

    // Validate standard date structure (YYYY-MM-DD)
    const dateParts = rawDate.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Qaabka taariikhdu ma saxna (Invalid date format)',
      });
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    const bookingDateObj = new Date(year, month - 1, day);
    if (
      isNaN(bookingDateObj.getTime()) ||
      bookingDateObj.getFullYear() !== year ||
      bookingDateObj.getMonth() !== month - 1 ||
      bookingDateObj.getDate() !== day
    ) {
      return res.status(400).json({
        success: false,
        message: 'Taariikhda la geliyey ma jirto (Invalid calendar date)',
      });
    }

    // Check if date is in the past (comparing against today's start of day)
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (bookingDateObj < todayMidnight) {
      return res.status(400).json({
        success: false,
        message:
          'Taariikhda ballansashadu ma noqon karto mid horey u soo martay / Booking date cannot be in the past',
      });
    }

    // 4. Time Validation
    const rawTime = time ? String(time).trim() : '';
    if (!rawTime) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan dooro waqtiga aad imaanayso / Booking time is required',
      });
    }
    if (rawTime.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Waqtigu ma dhaafi karo 20 xaraf / Time string is too long',
      });
    }

    // 5. Number of Guests Validation
    const guests = parseInt(numberOfGuests, 10);
    if (isNaN(guests) || !Number.isInteger(Number(numberOfGuests)) || guests < 1) {
      return res.status(400).json({
        success: false,
        message:
          'Tirada dadku waa inay noqotaa ugu yaraan 1 qof / Number of guests must be at least 1',
      });
    }
    if (guests > 50) {
      return res.status(400).json({
        success: false,
        message:
          'Tirada dadku ma dhaafi karto 50 qof hal mar / Number of guests cannot exceed 50',
      });
    }

    const sanitizedNotes = notes ? String(notes).trim().slice(0, 500) : '';

    // 6. Generate Unique Atomic Booking Number (e.g. AFLAX-B000001)
    const bookingNumber = await getNextBookingNumber();

    // 7. Format WhatsApp Message and Safe URL
    const tempBookingData = {
      bookingNumber,
      customerName: name,
      phone: rawPhone,
      date: rawDate,
      time: rawTime,
      numberOfGuests: guests,
      notes: sanitizedNotes,
    };

    // 7. Format WhatsApp Message and Safe URL using dynamic settings
    const settings = await RestaurantSettings.getSettings();
    const targetWhatsApp = settings?.whatsapp;

    const whatsappMessage = generateBookingWhatsAppMessage(tempBookingData);
    const whatsappUrl = generateBookingWhatsAppUrl(tempBookingData, targetWhatsApp);

    // 8. Save Booking to MongoDB (Always with pending status)
    const booking = new Booking({
      bookingNumber,
      customerName: name,
      phone: rawPhone,
      date: rawDate,
      time: rawTime,
      numberOfGuests: guests,
      notes: sanitizedNotes,
      status: 'pending', // Strictly initialized as pending
      whatsappUrl,
      whatsappMessage,
    });

    await booking.save();

    // 9. Return Clean Response (No technical secrets or raw Mongo internal metadata)
    return res.status(201).json({
      success: true,
      message:
        'Codsigaga ballansashada miiska si guul leh ayaa loo gudbiyey (Booking request submitted successfully)',
      data: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.customerName,
        phone: booking.phone,
        date: booking.date,
        formattedDate: formatBookingDate(booking.date),
        time: booking.time,
        formattedTime: formatBookingTime(booking.time),
        numberOfGuests: booking.numberOfGuests,
        notes: booking.notes,
        status: booking.status,
        whatsappMessage: booking.whatsappMessage,
        whatsappUrl: booking.whatsappUrl,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Booking by ID or Booking Number
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingNumber: id };
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Ballanta lama helin (Booking not found)',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.customerName,
        phone: booking.phone,
        date: booking.date,
        formattedDate: formatBookingDate(booking.date),
        time: booking.time,
        formattedTime: formatBookingTime(booking.time),
        numberOfGuests: booking.numberOfGuests,
        notes: booking.notes,
        status: booking.status,
        whatsappUrl: booking.whatsappUrl,
        whatsappMessage: booking.whatsappMessage,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingById,
};
