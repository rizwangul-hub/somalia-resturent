require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const slugify = require('../utils/slugify');
const { categories, menuItems } = require('../data/menuData');

/**
 * Safe database seed function
 * - Creates categories if they do not exist
 * - Creates menu items if they do not exist
 * - Avoids deleting or duplicating existing records
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed for AFLAX Restaurant...');

  const conn = await connectDB();
  if (!conn) {
    throw new Error('Database connection failed. Cannot proceed with seeding.');
  }

  // 1. Seed Categories
  const categoryMap = new Map();
  let categoriesCreated = 0;
  let categoriesExisting = 0;

  for (const cat of categories) {
    const slug = cat.slug || slugify(cat.name);
    let categoryDoc = await Category.findOne({ slug });

    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: cat.name,
        slug,
        description: cat.description || '',
        sortOrder: cat.sortOrder || 0,
        isActive: true,
      });
      categoriesCreated++;
    } else {
      categoriesExisting++;
    }

    categoryMap.set(slug, categoryDoc._id);
  }

  console.log(
    `📁 Categories: ${categoriesCreated} created, ${categoriesExisting} already existed (Total: ${categories.length})`
  );

  // 2. Seed Menu Items
  let itemsCreated = 0;
  let itemsExisting = 0;

  for (const item of menuItems) {
    const slug = slugify(item.name);
    const categoryId = categoryMap.get(item.categorySlug);

    if (!categoryId) {
      console.warn(`⚠️ Warning: Category "${item.categorySlug}" not found for item "${item.name}"`);
      continue;
    }

    let itemDoc = await MenuItem.findOne({ slug });

    if (!itemDoc) {
      itemDoc = await MenuItem.create({
        name: item.name,
        slug,
        category: categoryId,
        price: item.price,
        currency: 'USD',
        description: '',
        image: null,
        isAvailable: true,
        sortOrder: item.sortOrder || 0,
      });
      itemsCreated++;
    } else {
      itemsExisting++;
    }
  }

  console.log(
    `🍛 Menu Items: ${itemsCreated} created, ${itemsExisting} already existed (Total: ${menuItems.length})`
  );
  console.log('✅ Seeding completed successfully without deleting any existing data.');

  return {
    categoriesCreated,
    categoriesExisting,
    itemsCreated,
    itemsExisting,
    totalCategories: categories.length,
    totalItems: menuItems.length,
  };
}

// Run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Seeding error:', error);
      await mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = seedDatabase;
