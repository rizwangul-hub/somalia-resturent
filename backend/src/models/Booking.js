const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: [true, 'Booking number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters'],
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
      minlength: [6, 'Customer phone must be at least 6 characters'],
      maxlength: [25, 'Customer phone cannot exceed 25 characters'],
    },
    date: {
      type: String,
      required: [true, 'Booking date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Booking time is required'],
      trim: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
      max: [50, 'Number of guests cannot exceed 50'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of guests must be an integer',
      },
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    whatsappUrl: {
      type: String,
      default: null,
    },
    whatsappMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ date: 1, time: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
