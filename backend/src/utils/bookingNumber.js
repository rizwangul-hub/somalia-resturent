const Counter = require('../models/Counter');
const Booking = require('../models/Booking');

/**
 * Atomically generates the next unique human-friendly booking number.
 * Format: AFLAX-B000001
 */
async function getNextBookingNumber() {
  const existingCounter = await Counter.findById('bookingNumber');
  if (!existingCounter) {
    const existingBookingsCount = await Booking.countDocuments();
    if (existingBookingsCount > 0) {
      await Counter.findByIdAndUpdate(
        'bookingNumber',
        { $setOnInsert: { seq: existingBookingsCount } },
        { upsert: true }
      );
    }
  }

  const counter = await Counter.findByIdAndUpdate(
    'bookingNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `AFLAX-B${formattedSeq}`;
}

module.exports = {
  getNextBookingNumber,
};
