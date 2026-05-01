const { query, run, get } = require('../config/database-production');

// Get all orders for a user
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, status, limit = 100, offset = 0 } = req.query;

    let sql = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await query(sql, params);

    // Parse items JSON for each order
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json({
      success: true,
      data: ordersWithParsedItems,
      count: ordersWithParsedItems.length
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Parse items JSON
    order.items = JSON.parse(order.items);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      customer_name,
      customer_phone,
      platform,
      items,
      total_amount,
      notes,
      status
    } = req.body;

    // Validation
    if (!customer_name || !customer_phone || !platform || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, platform, items, and total amount are required'
      });
    }

    // Validate items is an array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array'
      });
    }

    const result = await run(
      `INSERT INTO orders (
        user_id, customer_name, customer_phone, platform, items, total_amount, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        customer_name,
        customer_phone,
        platform,
        JSON.stringify(items),
        total_amount,
        notes || null,
        status || 'pending'
      ]
    );

    const newOrder = await get(
      'SELECT * FROM orders WHERE id = ?',
      [result.id]
    );

    // Parse items JSON
    newOrder.items = JSON.parse(newOrder.items);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const {
      customer_name,
      customer_phone,
      platform,
      items,
      total_amount,
      notes,
      status
    } = req.body;

    // Check if order exists and belongs to user
    const existingOrder = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prepare items JSON if provided
    let itemsJson = existingOrder.items;
    if (items) {
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items must be an array'
        });
      }
      itemsJson = JSON.stringify(items);
    }

    await run(
      `UPDATE orders SET
        customer_name = ?,
        customer_phone = ?,
        platform = ?,
        items = ?,
        total_amount = ?,
        notes = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [
        customer_name !== undefined ? customer_name : existingOrder.customer_name,
        customer_phone !== undefined ? customer_phone : existingOrder.customer_phone,
        platform !== undefined ? platform : existingOrder.platform,
        itemsJson,
        total_amount !== undefined ? total_amount : existingOrder.total_amount,
        notes !== undefined ? notes : existingOrder.notes,
        status !== undefined ? status : existingOrder.status,
        orderId,
        userId
      ]
    );

    const updatedOrder = await get(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    // Parse items JSON
    updatedOrder.items = JSON.parse(updatedOrder.items);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Check if order exists and belongs to user
    const existingOrder = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await run(
      'DELETE FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall stats
    const overallStats = await get(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders 
      WHERE user_id = ?`,
      [userId]
    );

    // Stats by platform
    const platformStats = await query(
      `SELECT 
        platform,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE user_id = ?
      GROUP BY platform
      ORDER BY order_count DESC`,
      [userId]
    );

    // Today's stats
    const todayStats = await get(
      `SELECT 
        COUNT(*) as today_orders,
        SUM(total_amount) as today_revenue
      FROM orders 
      WHERE user_id = ? AND DATE(created_at) = DATE('now')`,
      [userId]
    );

    // Recent orders
    const recentOrders = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    // Parse items for recent orders
    const recentOrdersParsed = recentOrders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json({
      success: true,
      data: {
        overall: overallStats,
        by_platform: platformStats,
        today: todayStats,
        recent_orders: recentOrdersParsed
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, processing, completed, cancelled'
      });
    }

    // Check if order exists and belongs to user
    const existingOrder = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, orderId, userId]
    );

    const updatedOrder = await get(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    // Parse items JSON
    updatedOrder.items = JSON.parse(updatedOrder.items);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};
