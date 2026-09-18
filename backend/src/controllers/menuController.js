const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const escapeRegex = require('../utils/escapeRegex');

/**
 * @desc    Get all menu items with query filtering (category, search, available)
 * @route   GET /api/menu
 * @access  Public
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;
    const query = {};

    // 1. Filter by category (by ObjectId or slug)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category.toLowerCase().trim() });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // If category slug doesn't exist, return empty data
          return res.status(200).json({
            success: true,
            count: 0,
            data: [],
          });
        }
      }
    }

    // 2. Filter by search keyword (safely escaped)
    if (search && search.trim() !== '') {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    // 3. Filter by availability
    if (available !== undefined) {
      query.isAvailable = available === 'true' || available === true;
    }

    const items = await MenuItem.find(query)
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single menu item by ID or slug
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let item = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await MenuItem.findById(id).populate('category', 'name slug');
    } else {
      item = await MenuItem.findOne({ slug: id.toLowerCase().trim() }).populate(
        'category',
        'name slug'
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get menu items by category ID or slug
 * @route   GET /api/menu/category/:categoryId
 * @access  Public
 */
const getMenuItemsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    let catId = null;

    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      catId = categoryId;
    } else {
      const catDoc = await Category.findOne({ slug: categoryId.toLowerCase().trim() });
      if (!catDoc) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
      catId = catDoc._id;
    }

    const items = await MenuItem.find({ category: catId, isAvailable: true })
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
};
