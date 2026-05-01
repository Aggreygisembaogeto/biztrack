const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllUsers,
  getUserDetails,
  getPlatformStats,
  getRecentActivity,
  deleteUser
} = require('../controllers/adminController');

// All routes require authentication
router.use(auth);

// Get all users
router.get('/users', getAllUsers);

// Get platform statistics
router.get('/stats', getPlatformStats);

// Get recent activity
router.get('/activity', getRecentActivity);

// Get user details
router.get('/users/:id', getUserDetails);

// Delete user
router.delete('/users/:id', deleteUser);

module.exports = router;
