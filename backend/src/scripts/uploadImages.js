require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { syncMenuImages } = require('../services/cloudinaryService');

async function runImageSync() {
  console.log('🚀 Starting AFLAX Restaurant image sync process...');
  const conn = await connectDB();

  if (!conn) {
    console.error('❌ Could not connect to database. Aborting image sync.');
    process.exit(1);
  }

  try {
    const report = await syncMenuImages();

    console.log('\n=============================================');
    console.log('       AFLAX IMAGE SYNC SUMMARY REPORT        ');
    console.log('=============================================');
    console.log(`Cloudinary Configured : ${report.cloudinaryConfigured ? 'YES' : 'NO (Credentials required)'}`);
    console.log(`Cloudinary Target     : ${report.cloudinaryFolder}`);
    console.log(`Total Files in Folder : ${report.totalImagesInFolder}`);
    console.log(`Total Menu Items      : ${report.totalMenuItems}`);
    console.log(`Confidently Matched   : ${report.confidentlyMatched}`);
    console.log(`Successfully Uploaded : ${report.uploaded}`);
    console.log(`Upload Failed         : ${report.failed}`);
    console.log(`Needs Manual Matching : ${report.unmatchedItems.length}`);
    console.log('=============================================\n');

    if (report.unmatchedItems.length > 0) {
      console.log('⚠️ Items Needing Manual Review:');
      report.unmatchedItems.forEach((u) => console.log(` - ${u.name}: ${u.reason}`));
      console.log('');
    }

    if (!report.cloudinaryConfigured) {
      console.log('ℹ️ Cloudinary credentials not configured in backend/.env.');
      console.log('   Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      console.log('   to backend/.env to execute live uploads.\n');
    }
  } catch (err) {
    console.error('❌ Error during image sync:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  runImageSync();
}

module.exports = runImageSync;
