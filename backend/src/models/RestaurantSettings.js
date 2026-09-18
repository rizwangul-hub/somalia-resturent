const mongoose = require('mongoose');

const restaurantSettingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      default: 'AFLAX Restaurant',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      default: '61 0723233',
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      default: '+252610723233',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      default: 'Degmada Yaqshiid, Somalia',
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      trim: true,
      uppercase: true,
      default: 'USD',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to get or create the single restaurant settings record
restaurantSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      restaurantName: 'AFLAX Restaurant',
      phone: '61 0723233',
      whatsapp: '+252610723233',
      location: 'Degmada Yaqshiid, Somalia',
      currency: 'USD',
      description: '',
      logo: null,
    });
  }
  return settings;
};

const RestaurantSettings = mongoose.model('RestaurantSettings', restaurantSettingsSchema);

module.exports = RestaurantSettings;
