const Counter = require('../models/Counter');
const Order = require('../models/Order');

/**
 * Atomically generates the next unique human-friendly order number.
 * Format: AFLAX-000001
 */
async function getNextOrderNumber() {
  // Ensure the counter is initialized properly if orders already exist
  const existingCounter = await Counter.findById('orderNumber');
  if (!existingCounter) {
    const existingOrdersCount = await Order.countDocuments();
    if (existingOrdersCount > 0) {
      await Counter.findByIdAndUpdate(
        'orderNumber',
        { $setOnInsert: { seq: existingOrdersCount } },
        { upsert: true }
      );
    }
  }

  const counter = await Counter.findByIdAndUpdate(
    'orderNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `AFLAX-${formattedSeq}`;
}

module.exports = {
  getNextOrderNumber,
};
