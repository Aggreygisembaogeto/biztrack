const pool = require('../config/database');

// Get all users with their statistics
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.business_name,
        u.role,
        u.subscription_plan,
        u.subscription_status,
        u.commission_rate,
        u.created_at,
        COUNT(DISTINCT t.id) as total_transactions,
        COALESCE(SUM(CASE WHEN t.type = 'payment' OR t.type = 'sale' THEN t.amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      WHERE u.role != 'super_admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    // Total users
    const usersResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE role != 'super_admin'
    `);
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total transactions
    const transactionsResult = await pool.query(`
      SELECT COUNT(*) as count FROM transactions
    `);
    const totalTransactions = parseInt(transactionsResult.rows[0].count);

    // Total revenue (all users combined)
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type IN ('payment', 'sale')
    `);
    const totalRevenue = parseFloat(revenueResult.rows[0].total);

    // Total commissions earned
    const commissionsResult = await pool.query(`
      SELECT COALESCE(SUM(commission_amount), 0) as total
      FROM commissions
    `);
    const totalCommissions = parseFloat(commissionsResult.rows[0].total);

    // Pending commissions
    const pendingCommissionsResult = await pool.query(`
      SELECT COALESCE(SUM(commission_amount), 0) as total
      FROM commissions
      WHERE status = 'pending'
    `);
    const pendingCommissions = parseFloat(pendingCommissionsResult.rows[0].total);

    // Users by subscription plan
    const planDistribution = await pool.query(`
      SELECT subscription_plan, COUNT(*) as count
      FROM users
      WHERE role != 'super_admin'
      GROUP BY subscription_plan
    `);

    // Recent signups (last 30 days)
    const recentSignups = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role != 'super_admin'
      AND created_at >= datetime('now', '-30 days')
    `);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalRevenue,
        totalCommissions,
        pendingCommissions,
        planDistribution: planDistribution.rows,
        recentSignups: parseInt(recentSignups.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics'
    });
  }
};

// Get all commissions
exports.getAllCommissions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.email as user_email,
        u.business_name,
        t.description as transaction_description
      FROM commissions c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN transactions t ON c.transaction_id = t.id
      ORDER BY c.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commissions'
    });
  }
};

// Update user subscription
exports.updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscription_plan, subscription_status, commission_rate } = req.body;

    await pool.query(`
      UPDATE users
      SET subscription_plan = $1,
          subscription_status = $2,
          commission_rate = $3
      WHERE id = $4 AND role != 'super_admin'
    `, [subscription_plan, subscription_status, commission_rate, userId]);

    res.json({
      success: true,
      message: 'User subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting super admin
    const userCheck = await pool.query(`
      SELECT role FROM users WHERE id = $1
    `, [userId]);

    if (userCheck.rows[0]?.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    // Delete user (transactions will be kept for audit)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// Mark commission as paid
exports.markCommissionPaid = async (req, res) => {
  try {
    const { commissionId } = req.params;

    await pool.query(`
      UPDATE commissions
      SET status = 'paid',
          paid_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [commissionId]);

    res.json({
      success: true,
      message: 'Commission marked as paid'
    });
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating commission'
    });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM subscription_plans ORDER BY price ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans'
    });
  }
};

// Update platform settings
exports.updatePlatformSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO platform_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key)
        DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, value]);
    }

    res.json({
      success: true,
      message: 'Platform settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating platform settings'
    });
  }
};

// Get platform settings
exports.getPlatformSettings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM platform_settings
    `);

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform settings'
    });
  }
};
