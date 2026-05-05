const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is super admin
const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin only.'
    });
  }
  next();
};

// Apply auth and super admin middleware to all routes
router.use(authMiddleware);
router.use(superAdminMiddleware);

// Users management
router.get('/users', superAdminController.getAllUsers);
router.delete('/users/:userId', superAdminController.deleteUser);
router.put('/users/:userId/subscription', superAdminController.updateUserSubscription);

// Platform statistics
router.get('/stats', superAdminController.getPlatformStats);

// Commissions
router.get('/commissions', superAdminController.getAllCommissions);
router.put('/commissions/:commissionId/mark-paid', superAdminController.markCommissionPaid);

// Subscription plans
router.get('/subscription-plans', superAdminController.getSubscriptionPlans);

// Platform settings
router.get('/settings', superAdminController.getPlatformSettings);
router.put('/settings', superAdminController.updatePlatformSettings);

module.exports = router;
