const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders — Create new order
router.post('/', orderController.createOrder);

// GET /api/orders/:id — Retrieve order by ID or orderNumber
router.get('/:id', orderController.getOrderById);

module.exports = router;
