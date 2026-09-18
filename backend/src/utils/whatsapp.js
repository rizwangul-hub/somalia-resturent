/**
 * WhatsApp Integration Utilities for AFLAX Restaurant
 * WhatsApp Destination: +252771989981 (Degmada Yaqshiid, Somalia)
 */

const RESTAURANT_WHATSAPP_NUMBER = '252771989981';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats a date string (e.g. YYYY-MM-DD) into 'Month DD, YYYY'
 * Avoids UTC timezone shifting by parsing components directly.
 */
function formatBookingDate(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).trim().split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
      return `${MONTH_NAMES[monthIndex]} ${day}, ${year}`;
    }
  }
  return dateStr;
}

/**
 * Formats a 24-hour time string (e.g. '14:30' or '09:00') into 12-hour AM/PM format
 */
function formatBookingTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  // If already formatted with AM/PM
  if (/am|pm/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    if (!isNaN(hours)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${hours}:${minutes} ${period}`;
    }
  }
  return timeStr;
}

/**
 * Dynamically generates a clean, human-readable WhatsApp message from an order.
 * @param {Object} order - The saved order document or object
 * @returns {string} Formatted WhatsApp message
 */
function generateWhatsAppMessage(order) {
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — $${Number(item.subtotal).toFixed(2)}`
    )
    .join('\n');

  let message = `🍽️ AFLAX Restaurant — New Order\n`;
  message += `🧾 Order No: ${order.orderNumber}\n`;
  message += `👤 Name: ${order.customer.name}\n`;
  message += `📞 Phone: ${order.customer.phone}\n`;
  message += `🛒 Order:\n${itemsText}\n`;
  message += `💰 Total: $${Number(order.total).toFixed(2)} ${order.currency || 'USD'}`;

  if (order.customer.notes && order.customer.notes.trim()) {
    message += `\n📝 Notes: ${order.customer.notes.trim()}`;
  }

  return message;
}

/**
 * Generates the safe, URL-encoded WhatsApp link for an order.
 * @param {Object} order - The saved order document or object
 * @param {string} [targetNumber] - Optional destination WhatsApp number
 * @returns {string} Complete wa.me URL
 */
function generateWhatsAppUrl(order, targetNumber) {
  const message = generateWhatsAppMessage(order);
  const encodedText = encodeURIComponent(message);
  const rawNum = targetNumber || RESTAURANT_WHATSAPP_NUMBER;
  const cleanNumber = String(rawNum).replace(/[^0-9]/g, '') || RESTAURANT_WHATSAPP_NUMBER;
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Dynamically generates a clean, human-readable WhatsApp message for a table booking.
 * @param {Object} booking - The saved booking document or object
 * @returns {string} Formatted WhatsApp booking message
 */
function generateBookingWhatsAppMessage(booking) {
  const formattedDate = formatBookingDate(booking.date);
  const formattedTime = formatBookingTime(booking.time);

  let message = `🍽️ Book a Table — AFLAX Restaurant\n`;
  message += `🔖 Booking No: ${booking.bookingNumber}\n`;
  message += `👤 Name: ${booking.customerName}\n`;
  message += `📞 Phone: ${booking.phone}\n`;
  message += `📅 Date: ${formattedDate}\n`;
  message += `⏰ Time: ${formattedTime}\n`;
  message += `👥 Number of Guests: ${booking.numberOfGuests}`;

  if (booking.notes && booking.notes.trim()) {
    message += `\n📝 Notes: ${booking.notes.trim()}`;
  }

  return message;
}

/**
 * Generates the safe, URL-encoded WhatsApp link for a table booking.
 * @param {Object} booking - The saved booking document or object
 * @param {string} [targetNumber] - Optional destination WhatsApp number
 * @returns {string} Complete wa.me URL
 */
function generateBookingWhatsAppUrl(booking, targetNumber) {
  const message = generateBookingWhatsAppMessage(booking);
  const encodedText = encodeURIComponent(message);
  const rawNum = targetNumber || RESTAURANT_WHATSAPP_NUMBER;
  const cleanNumber = String(rawNum).replace(/[^0-9]/g, '') || RESTAURANT_WHATSAPP_NUMBER;
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

module.exports = {
  RESTAURANT_WHATSAPP_NUMBER,
  formatBookingDate,
  formatBookingTime,
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  generateBookingWhatsAppMessage,
  generateBookingWhatsAppUrl,
};
