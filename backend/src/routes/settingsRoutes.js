const express = require('express');
const router = express.Router();
const RestaurantSettings = require('../models/RestaurantSettings');

/**
 * Public endpoint to get safe non-sensitive restaurant settings
 * GET /api/settings
 */
router.get('/', async (req, res, next) => {
  try {
    const settings = await RestaurantSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: {
        restaurantName: settings.restaurantName,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        location: settings.location,
        currency: settings.currency,
        description: settings.description || '',
        logo: settings.logo || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
