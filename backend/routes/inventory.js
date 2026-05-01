const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getInventory,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryQuantity,
  getLowStockItems,
  getInventoryStats
} = require('../controllers/inventoryController');

// All routes require authentication
router.use(auth);

// Get all inventory items
router.get('/', getInventory);

// Get inventory statistics
router.get('/stats', getInventoryStats);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get single inventory item
router.get('/:id', getInventoryItem);

// Add new inventory item
router.post('/', addInventoryItem);

// Update inventory item
router.put('/:id', updateInventoryItem);

// Update inventory quantity (for sales deduction)
router.patch('/:id/quantity', updateInventoryQuantity);

// Delete inventory item
router.delete('/:id', deleteInventoryItem);

module.exports = router;
