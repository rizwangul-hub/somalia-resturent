const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/adminAuthController');
const { requireAdmin } = require('../middleware/auth');

// ================= AUTHENTICATION (PUBLIC LOGIN) =================
// POST /api/admin/auth/login — Admin login
router.post('/auth/login', adminAuthController.login);

// ================= PROTECTED ADMIN ROUTES =================
// GET /api/admin/auth/me — Check/restore active admin session
router.get('/auth/me', requireAdmin, adminAuthController.getMe);

// Apply requireAdmin middleware to all subsequent admin routes
router.use(requireAdmin);

// GET /api/admin/dashboard — Overview stats and recent activity
router.get('/dashboard', adminController.getDashboardOverview);

// GET /api/admin/analytics — In-depth analytics, sales reports & popular items
router.get('/analytics', adminController.getDashboardAnalytics);

// GET /api/admin/orders — Paginated & searchable orders
router.get('/orders', adminController.getAdminOrders);

// PATCH /api/admin/orders/:id/status — Update order status
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// GET /api/admin/bookings — Paginated & searchable bookings
router.get('/bookings', adminController.getAdminBookings);

// PATCH /api/admin/bookings/:id/status — Update booking status
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// GET /api/admin/menu — All menu items with categories
router.get('/menu', adminController.getAdminMenu);

// POST /api/admin/menu — Create new menu item
router.post('/menu', adminController.createMenuItem);

// PATCH /api/admin/menu/:id — Update existing menu item
router.patch('/menu/:id', adminController.updateMenuItem);

// PATCH /api/admin/menu/:id/availability — Toggle availability
router.patch('/menu/:id/availability', adminController.toggleMenuItemAvailability);

// GET /api/admin/categories — All categories with counts
router.get('/categories', adminController.getAdminCategories);

// POST /api/admin/categories — Create new category
router.post('/categories', adminController.createCategory);

// PATCH /api/admin/categories/:id — Update existing category
router.patch('/categories/:id', adminController.updateCategory);

// GET /api/admin/settings — Get restaurant settings
router.get('/settings', adminController.getAdminSettings);

// PATCH /api/admin/settings — Update restaurant settings
router.patch('/settings', adminController.updateAdminSettings);

module.exports = router;
