const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const RestaurantSettings = require('../models/RestaurantSettings');
const slugify = require('../utils/slugify');
const escapeRegex = require('../utils/escapeRegex');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Get Admin Dashboard Overview Statistics & Recent Activity
 * GET /api/admin/dashboard
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const [
      totalMenuItems,
      availableMenuItems,
      pendingOrders,
      pendingBookings,
      totalOrders,
      totalBookings,
      recentOrders,
      recentBookings,
      upcomingBookings,
    ] = await Promise.all([
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
      Order.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Booking.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Booking.find().sort({ createdAt: -1 }).limit(5),
      Booking.find({
        date: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      })
        .sort({ date: 1, time: 1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMenuItems,
          availableMenuItems,
          unavailableMenuItems: totalMenuItems - availableMenuItems,
          pendingOrders,
          pendingBookings,
          totalOrders,
          totalBookings,
        },
        recentOrders,
        recentBookings,
        upcomingBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Paginated & Searchable Orders for Admin
 * GET /api/admin/orders
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Order Status
 * PATCH /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (typeof id === 'string' && /^AFLAX-[A-Z0-9]+$/i.test(id.trim())) {
      query = { orderNumber: id.trim().toUpperCase() };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format. Must be a valid MongoDB ObjectId or Order Number (e.g. AFLAX-O000001)',
      });
    }

    const order = await Order.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Paginated & Searchable Bookings for Admin
 * GET /api/admin/bookings
 */
const getAdminBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';
    const dateFilter = req.query.dateFilter ? String(req.query.dateFilter).trim() : '';
    const specificDate = req.query.date ? String(req.query.date).trim() : '';

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { bookingNumber: searchRegex },
        { customerName: searchRegex },
        { phone: searchRegex },
      ];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      filter.date = todayStr;
    } else if (dateFilter === 'upcoming') {
      filter.date = { $gte: todayStr };
    } else if (specificDate) {
      filter.date = specificDate;
    } else if (dateFilter && dateFilter !== 'all' && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
      filter.date = dateFilter;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Booking Status
 * PATCH /api/admin/bookings/:id/status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (typeof id === 'string' && /^AFLAX-B[A-Z0-9]+$/i.test(id.trim())) {
      query = { bookingNumber: id.trim().toUpperCase() };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format. Must be a valid MongoDB ObjectId or Booking Number (e.g. AFLAX-B000001)',
      });
    }

    const booking = await Booking.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Menu Items with Category details for Admin
 * GET /api/admin/menu
 */
const getAdminMenu = async (req, res, next) => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const category = req.query.category ? String(req.query.category).trim() : '';

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.name = new RegExp(escapeRegex(search), 'i');
    }

    const items = await MenuItem.find(filter)
      .populate('category', 'name slug icon')
      .sort({ sortOrder: 1, name: 1 });

    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Menu Item Availability
 * PATCH /api/admin/menu/:id/availability
 */
const toggleMenuItemAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body || {};

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean (true or false)',
      });
    }

    const item = await MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true }).populate(
      'category',
      'name slug icon'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Menu item availability updated to ${isAvailable ? 'Available' : 'Unavailable'}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Menu Item
 * POST /api/admin/menu
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, description, price, isAvailable, sortOrder, image } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Menu item name is required',
      });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: 'A valid category ID is required',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist',
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than or equal to 0',
      });
    }

    // Generate unique slug
    let baseSlug = slugify(name);
    if (!baseSlug) {
      baseSlug = `item-${Date.now()}`;
    }
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await MenuItem.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    let finalImageUrl = null;
    let finalCloudinaryId = null;

    if (image && typeof image === 'string' && image.trim()) {
      if (image.startsWith('data:image/') && isCloudinaryConfigured()) {
        try {
          const uploadRes = await uploadToCloudinary(image, uniqueSlug);
          finalImageUrl = uploadRes.secure_url;
          finalCloudinaryId = uploadRes.public_id;
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr.message);
          finalImageUrl = image; // fallback to data uri or url
        }
      } else {
        finalImageUrl = image.trim();
      }
    }

    const newItem = await MenuItem.create({
      name: String(name).trim(),
      slug: uniqueSlug,
      category,
      description: description ? String(description).trim() : '',
      price: numericPrice,
      currency: 'USD',
      image: finalImageUrl,
      cloudinaryPublicId: finalCloudinaryId,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      sortOrder: !isNaN(Number(sortOrder)) ? Number(sortOrder) : 0,
    });

    const populated = await MenuItem.findById(newItem._id).populate('category', 'name slug icon');

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Menu Item
 * PATCH /api/admin/menu/:id
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID',
      });
    }

    const existingItem = await MenuItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const { name, category, description, price, isAvailable, sortOrder, image } = req.body;

    const updates = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: 'Menu item name cannot be empty',
        });
      }
      updates.name = trimmedName;

      // Update slug only if name changed
      if (trimmedName.toLowerCase() !== existingItem.name.toLowerCase()) {
        let baseSlug = slugify(trimmedName);
        if (!baseSlug) baseSlug = `item-${Date.now()}`;
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await MenuItem.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        updates.slug = uniqueSlug;
      }
    }

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }
      const catDoc = await Category.findById(category);
      if (!catDoc) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist',
        });
      }
      updates.category = category;
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid number greater than or equal to 0',
        });
      }
      updates.price = numericPrice;
    }

    if (isAvailable !== undefined) {
      updates.isAvailable = Boolean(isAvailable);
    }

    if (sortOrder !== undefined && !isNaN(Number(sortOrder))) {
      updates.sortOrder = Number(sortOrder);
    }

    // Image handling: Only update image if explicitly passed and non-empty.
    // If undefined or empty string or null when client indicates "keep", keep existing image.
    if (image !== undefined && image !== null && String(image).trim() !== '') {
      const imgString = String(image).trim();
      // If client supplied a new base64 data uri
      if (imgString.startsWith('data:image/') && isCloudinaryConfigured()) {
        try {
          const itemSlug = updates.slug || existingItem.slug;
          const uploadRes = await uploadToCloudinary(imgString, itemSlug);
          updates.image = uploadRes.secure_url;
          updates.cloudinaryPublicId = uploadRes.public_id;
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr.message);
          updates.image = imgString;
        }
      } else {
        updates.image = imgString;
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug icon');

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Menu Item
 * DELETE /api/admin/menu/:id
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID',
      });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Clean up image from Cloudinary if hosted there
    if (item.cloudinaryPublicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await MenuItem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Menu item "${item.name}" deleted successfully`,
      data: { id: item._id, name: item.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories for Admin (including counts)
 * GET /api/admin/categories
 */
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    // Attach item count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await MenuItem.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          itemCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Category
 * POST /api/admin/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, sortOrder, isActive } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const trimmedName = String(name).trim();
    let baseSlug = slugify(trimmedName);
    if (!baseSlug) baseSlug = `category-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCategory = await Category.create({
      name: trimmedName,
      slug: uniqueSlug,
      description: description ? String(description).trim() : '',
      icon: icon ? String(icon).trim() : '🍽️',
      sortOrder: !isNaN(Number(sortOrder)) ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Category
 * PATCH /api/admin/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
      });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const { name, description, icon, sortOrder, isActive } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: 'Category name cannot be empty',
        });
      }
      updates.name = trimmedName;

      if (trimmedName.toLowerCase() !== existingCategory.name.toLowerCase()) {
        let baseSlug = slugify(trimmedName);
        if (!baseSlug) baseSlug = `category-${Date.now()}`;
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        updates.slug = uniqueSlug;
      }
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (icon !== undefined) {
      updates.icon = String(icon).trim();
    }

    if (sortOrder !== undefined && !isNaN(Number(sortOrder))) {
      updates.sortOrder = Number(sortOrder);
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Category
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Safety check: ensure no menu items are attached to this category
    const attachedItemsCount = await MenuItem.countDocuments({ category: id });
    if (attachedItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${attachedItemsCount} menu items are currently assigned to it. Please reassign or delete them first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
      data: { id: category._id, name: category.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Comprehensive Admin Analytics & Reports
 * GET /api/admin/analytics
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { range = 'month', startDate, endDate } = req.query;

    const now = new Date();
    let startDateTime = null;
    let endDateTime = new Date(now);

    if (range === 'today') {
      startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (range === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startDateTime = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (range === 'month') {
      startDateTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDateTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === 'custom') {
      if (startDate) {
        startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
      } else {
        startDateTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }
      if (endDate) {
        endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
      } else {
        endDateTime = new Date(now);
      }
    } else {
      // Default to month
      startDateTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const todayStr = now.toISOString().split('T')[0];
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // 1. Core KPIs across overall database
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalMenuItems,
      availableMenuItems,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'completed' }),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
    ]);

    // 2. Order statistics by time boundaries (today, week, month)
    const [ordersToday, ordersThisWeek, ordersThisMonth] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    // 3. Sales totals by time boundaries (Non-cancelled orders only, based on historical order prices!)
    const [todaySalesAgg, weekSalesAgg, monthSalesAgg, periodSalesAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startDateTime, $lte: endDateTime } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const salesToday = todaySalesAgg[0]?.total ? Math.round(todaySalesAgg[0].total * 100) / 100 : 0;
    const salesThisWeek = weekSalesAgg[0]?.total ? Math.round(weekSalesAgg[0].total * 100) / 100 : 0;
    const salesThisMonth = monthSalesAgg[0]?.total ? Math.round(monthSalesAgg[0].total * 100) / 100 : 0;
    const periodSales = periodSalesAgg[0]?.total ? Math.round(periodSalesAgg[0].total * 100) / 100 : 0;

    // 4. Booking statistics (today, upcoming)
    const [bookingsToday, upcomingBookingsCount] = await Promise.all([
      Booking.countDocuments({ date: todayStr }),
      Booking.countDocuments({
        date: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      }),
    ]);

    // 5. Popular Menu Items (Calculated from historical items snapshot in non-cancelled orders)
    const popularItemsAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startDateTime, $lte: endDateTime } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 },
    ]);

    const popularItems = popularItemsAgg.map((item) => ({
      name: item._id,
      quantity: item.totalQuantity,
      revenue: Math.round(item.totalRevenue * 100) / 100,
    }));

    // 6. Orders & Sales timeline for period charts
    const timelineAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startDateTime, $lte: endDateTime } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          ordersCount: { $sum: 1 },
          salesAmount: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const timeline = timelineAgg.map((t) => ({
      date: t._id,
      orders: t.ordersCount,
      sales: Math.round(t.salesAmount * 100) / 100,
    }));

    // 7. Recent Orders & Upcoming Bookings for dashboard tables
    const [recentOrders, upcomingBookings] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5),
      Booking.find({
        date: { $gte: todayStr },
        status: { $in: ['pending', 'confirmed'] },
      })
        .sort({ date: 1, time: 1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        filter: {
          range,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        },
        summary: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          completedBookings,
          totalMenuItems,
          availableMenuItems,
          unavailableMenuItems: totalMenuItems - availableMenuItems,
        },
        orders: {
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        sales: {
          today: salesToday,
          thisWeek: salesThisWeek,
          thisMonth: salesThisMonth,
          periodTotal: periodSales,
          currency: 'USD',
        },
        bookings: {
          today: bookingsToday,
          upcoming: upcomingBookingsCount,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          completed: completedBookings,
        },
        popularItems,
        timeline,
        recentOrders,
        upcomingBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Restaurant Settings for Admin
 * GET /api/admin/settings
 */
const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await RestaurantSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Restaurant Settings (Admin only)
 * PATCH /api/admin/settings
 */
const updateAdminSettings = async (req, res, next) => {
  try {
    const {
      restaurantName,
      phone,
      whatsapp,
      location,
      currency,
      description,
      logo,
    } = req.body;

    const updates = {};

    if (restaurantName !== undefined) {
      const trimmed = String(restaurantName).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant name cannot be empty',
        });
      }
      updates.restaurantName = trimmed;
    }

    if (phone !== undefined) {
      const trimmed = String(phone).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Phone number cannot be empty',
        });
      }
      updates.phone = trimmed;
    }

    if (whatsapp !== undefined) {
      const trimmed = String(whatsapp).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp number cannot be empty',
        });
      }
      updates.whatsapp = trimmed;
    }

    if (location !== undefined) {
      const trimmed = String(location).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Location cannot be empty',
        });
      }
      updates.location = trimmed;
    }

    if (currency !== undefined) {
      const trimmed = String(currency).trim().toUpperCase();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Currency cannot be empty',
        });
      }
      updates.currency = trimmed;
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    // Logo image handling: if base64 provided and Cloudinary configured, upload to Cloudinary.
    // If not provided or null, preserve existing logo!
    if (logo !== undefined && logo !== null && String(logo).trim() !== '') {
      const logoString = String(logo).trim();
      if (logoString.startsWith('data:image/') && isCloudinaryConfigured()) {
        try {
          const uploadRes = await uploadToCloudinary(logoString, 'aflax-restaurant-logo');
          updates.logo = uploadRes.secure_url;
          updates.cloudinaryPublicId = uploadRes.public_id;
        } catch (uploadErr) {
          console.warn('Logo Cloudinary upload warning:', uploadErr.message);
          updates.logo = logoString;
        }
      } else {
        updates.logo = logoString;
      }
    }

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(updates);
    } else {
      settings = await RestaurantSettings.findByIdAndUpdate(settings._id, updates, {
        new: true,
        runValidators: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Restaurant settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getAdminOrders,
  updateOrderStatus,
  getAdminBookings,
  updateBookingStatus,
  getAdminMenu,
  toggleMenuItemAvailability,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDashboardAnalytics,
  getAdminSettings,
  updateAdminSettings,
};
