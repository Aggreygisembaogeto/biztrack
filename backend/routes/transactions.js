const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getStatsByType,
  getStatsByCategory
} = require('../controllers/transactionController');

// All routes require authentication
router.use(auth);

// Get summary statistics
router.get('/summary', getSummary);

// Get statistics by type
router.get('/stats/type', getStatsByType);

// Get statistics by category
router.get('/stats/category', getStatsByCategory);

// Get all transactions
router.get('/', getTransactions);

// Get single transaction
router.get('/:id', getTransaction);

// Create new transaction
router.post('/', createTransaction);

// Update transaction
router.put('/:id', updateTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
