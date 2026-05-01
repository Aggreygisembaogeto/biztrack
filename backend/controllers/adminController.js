const { query, run, get } = require('../config/database-production');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@biztrack.com' && !adminEmail.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const users = await query(
      `SELECT 
        id, 
        email, 
        business_name, 
        phone, 
        address, 
        created_at,
        'active' as status
      FROM users 
      ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user details with statistics
exports.getUserDetails = async (req, res) => {
  try {
    // Check if user is admin
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@biztrack.com' && !adminEmail.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const userId = req.params.id;

    // Get user info
    const user = await get(
      'SELECT id, email, business_name, phone, address, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const salesStats = await get(
      `SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(amount), 0) as total_revenue
      FROM sales 
      WHERE user_id = ?`,
      [userId]
    );

    const ordersStats = await get(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as orders_revenue
      FROM orders 
      WHERE user_id = ?`,
      [userId]
    );

    const inventoryStats = await get(
      `SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(quantity * price), 0) as inventory_value
      FROM inventory 
      WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user,
        statistics: {
          sales: salesStats,
          orders: ordersStats,
          inventory: inventoryStats
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    // Check if user is admin
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@biztrack.com' && !adminEmail.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Total users
    const totalUsers = await get('SELECT COUNT(*) as count FROM users');

    // Total revenue from all sales
    const totalSalesRevenue = await get(
      'SELECT COALESCE(SUM(amount), 0) as revenue FROM sales'
    );

    // Total revenue from all orders
    const totalOrdersRevenue = await get(
      'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders'
    );

    // Total orders
    const totalOrders = await get('SELECT COUNT(*) as count FROM orders');

    // Total inventory items
    const totalInventory = await get('SELECT COUNT(*) as count FROM inventory');

    // New users today
    const newUsersToday = await get(
      `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')`
    );

    // Active users today (users who made sales or orders today)
    const activeUsersToday = await get(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM (
         SELECT user_id FROM sales WHERE DATE(created_at) = DATE('now')
         UNION
         SELECT user_id FROM orders WHERE DATE(created_at) = DATE('now')
       )`
    );

    // Top revenue generators
    const topRevenueUsers = await query(
      `SELECT 
        u.id,
        u.email,
        u.business_name,
        COALESCE(SUM(s.amount), 0) + COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.email, u.business_name
      ORDER BY total_revenue DESC
      LIMIT 5`
    );

    // Most active businesses (by order count)
    const mostActiveUsers = await query(
      `SELECT 
        u.id,
        u.email,
        u.business_name,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.email, u.business_name
      ORDER BY order_count DESC
      LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers.count,
          total_businesses: totalUsers.count,
          platform_revenue: parseFloat(totalSalesRevenue.revenue) + parseFloat(totalOrdersRevenue.revenue),
          total_orders: totalOrders.count,
          total_inventory_items: totalInventory.count,
          new_users_today: newUsersToday.count,
          active_users_today: activeUsersToday.count
        },
        top_revenue_generators: topRevenueUsers,
        most_active_businesses: mostActiveUsers
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
};

// Get recent activity across platform
exports.getRecentActivity = async (req, res) => {
  try {
    // Check if user is admin
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@biztrack.com' && !adminEmail.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const limit = parseInt(req.query.limit) || 20;

    // Get recent sales
    const recentSales = await query(
      `SELECT 
        s.id,
        s.item_name,
        s.amount,
        s.created_at,
        u.business_name,
        u.email,
        'sale' as activity_type
      FROM sales s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Get recent orders
    const recentOrders = await query(
      `SELECT 
        o.id,
        o.customer_name,
        o.total_amount,
        o.platform,
        o.created_at,
        u.business_name,
        u.email,
        'order' as activity_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Get recent user registrations
    const recentUsers = await query(
      `SELECT 
        id,
        email,
        business_name,
        created_at,
        'registration' as activity_type
      FROM users
      ORDER BY created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Combine and sort all activities
    const allActivities = [
      ...recentSales.map(s => ({
        type: 'sale',
        business: s.business_name,
        email: s.email,
        description: `Sale: ${s.item_name}`,
        amount: s.amount,
        timestamp: s.created_at
      })),
      ...recentOrders.map(o => ({
        type: 'order',
        business: o.business_name,
        email: o.email,
        description: `Order from ${o.customer_name} via ${o.platform}`,
        amount: o.total_amount,
        timestamp: o.created_at
      })),
      ...recentUsers.map(u => ({
        type: 'registration',
        business: u.business_name,
        email: u.email,
        description: `New business registered`,
        amount: null,
        timestamp: u.created_at
      }))
    ];

    // Sort by timestamp descending
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: allActivities.slice(0, limit)
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@biztrack.com' && !adminEmail.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (CASCADE will delete related data)
    await run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};
