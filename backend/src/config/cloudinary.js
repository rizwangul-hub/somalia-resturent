const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_CLOUD_NAME.trim() !== '' &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_KEY.trim() !== '' &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_API_SECRET.trim() !== ''
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
  console.log('☁️ Cloudinary configured successfully.');
} else {
  console.log('ℹ️ Cloudinary credentials not configured in .env (Phase 4 integration prepared).');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
