const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const MenuItem = require('../models/MenuItem');
const slugify = require('../utils/slugify');

const CLOUDINARY_FOLDER = 'aflax-restaurant/menu';
const LOCAL_IMAGE_DIR = path.resolve(__dirname, '../../../frontend/src/assets/image');

/**
 * Explicit mapping between exact menu item names and local image filenames
 */
const menuImageMap = {
  // Main Food (10 items)
  'Isisaar bariis': 'isisaar-bariis.jpg.jpg',
  'Baroosto': 'baroosto.jpg.jpeg',
  'Feeto malaay': 'feeto-malaay.jpg.jpg',
  'Canjeeyo maraq': 'Canjeero maraq.jpg.jpeg',
  'Haaf hilib': 'haaf-hilib.jpg.jpg',
  'Niic hilib': 'niic-hilib.jpg.jpg',
  'Muufo maraq iyo macsaro': 'muufo-maraq-macsaro.jpg.jpg',
  'Muufo maraq': 'muufo-maraq.jpg.jpg',
  'Soor iyo maraq': 'soor-maraq.jpg.jpeg',
  'Soor iyo caano geel': 'soor-caano-geel.jpg.jpeg',

  // Cunto fudud (18 items)
  'Shuwaarmo large': 'shuwaarmo-large.jpg.jpg',
  'Shuwaarmo mediam': 'shuwaarmo-medium.jpg.jpg',
  'Shuwaarmo small': 'shuwaarmo-small.jpg.jpg',
  'Ham beegar large': 'hambeegar-large.jpg.jpeg',
  'Ham beegar mediam': 'hambeegar-medium.jpg.jpg',
  'Hambeegar small': 'hambeegar-small.jpg.jpg',
  'Denimed large': 'denimed-large.jpg.jpg',
  'Denimed mediam': 'denimed-medium.jpg.jpg',
  'Denimed small': 'denimed-small.jpg.jpg',
  'Checking cheps': 'Chicken Chips.jpg.jpg',
  'Checking cheps chees': 'Chicken Chips Cheese.jpg.jpg',
  'Checking massala': 'Chicken Masala.jpg.jpg',
  'Chapati massala': 'Chapati Masala.jpg.jpg',
  'Cheps': 'Chips.jpg.jpeg',
  'Jabaati fuul': 'chapati full.jpg.jpeg',
  'Malabax odkac': 'Malabax odkac.jpg.jpeg',
  '1Jabaati xabadi': null, // Needs manual matching (no file supplied)
  'Malabax xabadi': 'Malabax xabadi.jpg.jpeg',

  // Sheetaro (6 items)
  'Sanbuus': 'Sanbuus.jpg.jpeg',
  'Bur': 'Bur.jpg.jpeg',
  '9Kackac': 'Kackac.jpg.jpeg',
  'Nafaqo': 'Nafaqo.jpg.jpeg',
  'Bajiye': 'Bajiye.jpg.jpeg',
  'Macsharo': 'Macsharo.jpg.jpeg',

  // Cawitaano (11 items)
  'Furulaato': 'Furulaato.jpg.jpeg',
  'Qaro': 'Qaro.jpg.jpeg',
  'Moos Iyo caano': 'Moos Iyo caano.jpg.jpeg',
  'Caano loos': 'Caano loos.jpg.jpg',
  'Babaay caano': 'Babaay caano.jpg.jpeg',
  'Isbarmuundo': 'Isbarmuundo.jpg.jpeg',
  'Afagaadho': 'Avacado-jpg.jpeg',
  'Maanga sheek': 'Mango shake.jpg.jpg',
  'Batiiq caano': 'Batiiq iyo caano.jpg.jpeg',
  'Isbaandhees': 'Isbaandhees.jpg.jpeg',
  'Liin macan': 'Liin macan.jpg.jpeg',

  // Espresso Machine (18 items)
  'Espresso': 'Espresso.jpg.jpg',
  'Coffee latte geel': 'Coffee Latte Geel.jpg.jpg',
  'Coffee latte booro': 'Coffee Latte Booro.jpg.jpg',
  'Copicino geel': 'Cappuccino Geel.jpg.jpg',
  'Copicino booro': 'Cappuccino Booro.jpg.jpg',
  'Shaah geel': 'Shaah Geel.jpg.jpg',
  'Shaah booro': 'Shaah Booro.jpg.jpg',
  'Qaxwo geel': 'Qaxwo Geel.jpg.jpg',
  'Qaxwo booro': 'Qaxwo Booro.jpg.jpg',
  'Flat white': 'Flat White.jpg.jpg',
  'Dodio': 'Dodio.jpg.jpg',
  'Lungo': 'Lungo.jpg.jpg',
  'Makayato esperro caano geel': 'Macchiato Espresso Caano Geel.jpg.jpg',
  'Makayato esperro caano buuro': 'Macchiato Espresso + Caano Buuro.jpg.jpg',
  'Cordado': 'Cortado.jpg.jpg',
  'Dawa tea': 'Dawa Tea.jpg.jpg',
  'Dangues geel': 'dangues-geel.jpg.jpeg',
  'Dangues booro': 'dangues-booro.jpg.jpeg',
};

/**
 * Upload a single image to Cloudinary
 */
async function uploadToCloudinary(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      },
    ],
  });
}

/**
 * Upload all mapped menu images to Cloudinary and update MongoDB
 */
async function syncMenuImages() {
  const isConfigured = isCloudinaryConfigured();

  const report = {
    cloudinaryConfigured: isConfigured,
    cloudinaryFolder: CLOUDINARY_FOLDER,
    totalImagesInFolder: 0,
    totalMenuItems: Object.keys(menuImageMap).length,
    confidentlyMatched: 0,
    uploaded: 0,
    failed: 0,
    unmatchedItems: [],
    details: [],
  };

  // Check local images directory
  if (fs.existsSync(LOCAL_IMAGE_DIR)) {
    const files = fs.readdirSync(LOCAL_IMAGE_DIR);
    report.totalImagesInFolder = files.length;
  } else {
    console.warn(`⚠️ Local image directory not found at: ${LOCAL_IMAGE_DIR}`);
  }

  for (const [itemName, filename] of Object.entries(menuImageMap)) {
    const itemSlug = slugify(itemName);

    if (!filename) {
      report.unmatchedItems.push({
        name: itemName,
        reason: 'Needs manual matching (no clear matching file in folder)',
      });
      report.details.push({
        name: itemName,
        localFile: null,
        status: 'Needs manual matching',
      });
      continue;
    }

    const localFilePath = path.join(LOCAL_IMAGE_DIR, filename);

    if (!fs.existsSync(localFilePath)) {
      report.details.push({
        name: itemName,
        localFile: filename,
        status: 'Local file missing',
      });
      continue;
    }

    report.confidentlyMatched++;

    if (isConfigured) {
      try {
        const uploadRes = await uploadToCloudinary(localFilePath, itemSlug);
        await MenuItem.findOneAndUpdate(
          { slug: itemSlug },
          {
            image: uploadRes.secure_url,
            cloudinaryPublicId: uploadRes.public_id,
          }
        );
        report.uploaded++;
        report.details.push({
          name: itemName,
          localFile: filename,
          status: 'Uploaded',
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
        });
      } catch (err) {
        report.failed++;
        report.details.push({
          name: itemName,
          localFile: filename,
          status: 'Upload failed',
          error: err.message,
        });
      }
    } else {
      report.details.push({
        name: itemName,
        localFile: filename,
        status: 'Matched (Upload pending Cloudinary credentials)',
      });
    }
  }

  return report;
}

module.exports = {
  menuImageMap,
  syncMenuImages,
  uploadToCloudinary,
  CLOUDINARY_FOLDER,
  LOCAL_IMAGE_DIR,
};
