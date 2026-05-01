const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesaController');
const authMiddleware = require('../middleware/auth');

// POST /api/mpesa/initiate - requires authentication
router.post('/initiate', authMiddleware, mpesaController.initiatePayment);

// POST /api/mpesa/callback - public endpoint for M-PESA callbacks
router.post('/callback', mpesaController.mpesaCallback);

module.exports = router;
