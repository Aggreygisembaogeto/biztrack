const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// POST /api/ai/ask
router.post('/ask', aiController.askAI);

module.exports = router;
