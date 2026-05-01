const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesStats,
  getSalesByDateRange
} = require('../controllers/salesController');

// All routes require authentication
router.use(auth);

// Get all sales
router.get('/', getSales);

// Get sales statistics
router.get('/stats', getSalesStats);

// Get sales by date range
router.get('/date-range', getSalesByDateRange);

// Get single sale
router.get('/:id', getSale);

// Create new sale
router.post('/', createSale);

// Update sale
router.put('/:id', updateSale);

// Delete sale
router.delete('/:id', deleteSale);

module.exports = router;
