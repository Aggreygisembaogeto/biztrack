const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  updateOrderStatus
} = require('../controllers/ordersController');

// All routes require authentication
router.use(auth);

// Get all orders
router.get('/', getOrders);

// Get order statistics
router.get('/stats', getOrderStats);

// Get single order
router.get('/:id', getOrder);

// Create new order
router.post('/', createOrder);

// Update order
router.put('/:id', updateOrder);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router;
