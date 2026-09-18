const Admin = require('../models/Admin');

/**
 * Seeds the initial AFLAX Restaurant admin account safely.
 * Does not duplicate if an admin with the same email already exists.
 */
async function seedAdmin() {
  const adminName = process.env.ADMIN_NAME || 'AFLAX Admin';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aflax.so').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AflaxAdmin2026!';

  try {
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      return existingAdmin;
    }

    const passwordHash = await Admin.hashPassword(adminPassword);
    const newAdmin = new Admin({
      name: adminName,
      email: adminEmail,
      passwordHash,
      isActive: true,
    });

    await newAdmin.save();
    console.log(`👤 Initial AFLAX Admin created: ${adminEmail}`);
    return newAdmin;
  } catch (error) {
    console.error('⚠️ Error seeding initial admin:', error.message);
    throw error;
  }
}

// Allow running directly via CLI (e.g. node src/scripts/seedAdmin.js)
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');

  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      process.exit(0);
    } catch (err) {
      console.error('Fatal seedAdmin error:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedAdmin;
