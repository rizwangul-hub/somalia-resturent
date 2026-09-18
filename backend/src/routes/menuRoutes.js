const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
} = require('../controllers/menuController');

// Specific category subroute must be declared before generic :id
router.get('/category/:categoryId', getMenuItemsByCategory);
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

module.exports = router;
