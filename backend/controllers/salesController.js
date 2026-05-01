const { query, run, get } = require('../config/database-production');

// Get all sales for a user
exports.getSales = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 100, offset = 0, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM sales WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (startDate) {
      sql += ' AND DATE(created_at) >= DATE(?)';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND DATE(created_at) <= DATE(?)';
      params.push(endDate);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const sales = await query(sql, params);

    res.json({
      success: true,
      data: sales,
      count: sales.length
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales'
    });
  }
};

// Get single sale
exports.getSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;

    const sale = await get(
      'SELECT * FROM sales WHERE id = ? AND user_id = ?',
      [saleId, userId]
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale'
    });
  }
};

// Create new sale
exports.createSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      item_name,
      quantity,
      unit,
      unit_price,
      amount,
      customer_phone,
      status
    } = req.body;

    // Validation
    if (!item_name || !quantity || !unit_price || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Item name, quantity, unit price, and amount are required'
      });
    }

    const result = await run(
      `INSERT INTO sales (
        user_id, item_name, quantity, unit, unit_price, amount, customer_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        item_name,
        quantity,
        unit || 'units',
        unit_price,
        amount,
        customer_phone || null,
        status || 'completed'
      ]
    );

    const newSale = await get(
      'SELECT * FROM sales WHERE id = ?',
      [result.id]
    );

    // Update inventory if item exists
    try {
      const inventoryItem = await get(
        'SELECT * FROM inventory WHERE user_id = ? AND LOWER(name) = LOWER(?)',
        [userId, item_name]
      );

      if (inventoryItem) {
        const newQuantity = parseFloat(inventoryItem.quantity) - parseFloat(quantity);
        if (newQuantity >= 0) {
          await run(
            'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newQuantity, inventoryItem.id]
          );
        }
      }
    } catch (invError) {
      console.error('Inventory update error:', invError);
      // Continue even if inventory update fails
    }

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: newSale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record sale'
    });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;
    const {
      item_name,
      quantity,
      unit,
      unit_price,
      amount,
      customer_phone,
      status
    } = req.body;

    // Check if sale exists and belongs to user
    const existingSale = await get(
      'SELECT * FROM sales WHERE id = ? AND user_id = ?',
      [saleId, userId]
    );

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    await run(
      `UPDATE sales SET
        item_name = ?,
        quantity = ?,
        unit = ?,
        unit_price = ?,
        amount = ?,
        customer_phone = ?,
        status = ?
      WHERE id = ? AND user_id = ?`,
      [
        item_name !== undefined ? item_name : existingSale.item_name,
        quantity !== undefined ? quantity : existingSale.quantity,
        unit !== undefined ? unit : existingSale.unit,
        unit_price !== undefined ? unit_price : existingSale.unit_price,
        amount !== undefined ? amount : existingSale.amount,
        customer_phone !== undefined ? customer_phone : existingSale.customer_phone,
        status !== undefined ? status : existingSale.status,
        saleId,
        userId
      ]
    );

    const updatedSale = await get(
      'SELECT * FROM sales WHERE id = ?',
      [saleId]
    );

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sale'
    });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;

    // Check if sale exists and belongs to user
    const existingSale = await get(
      'SELECT * FROM sales WHERE id = ? AND user_id = ?',
      [saleId, userId]
    );

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    await run(
      'DELETE FROM sales WHERE id = ? AND user_id = ?',
      [saleId, userId]
    );

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sale'
    });
  }
};

// Get sales statistics
exports.getSalesStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall stats
    const overallStats = await get(
      `SELECT 
        COUNT(*) as total_sales,
        SUM(amount) as total_revenue,
        AVG(amount) as average_sale
      FROM sales 
      WHERE user_id = ?`,
      [userId]
    );

    // Today's stats
    const todayStats = await get(
      `SELECT 
        COUNT(*) as today_sales,
        SUM(amount) as today_revenue
      FROM sales 
      WHERE user_id = ? AND DATE(created_at) = DATE('now')`,
      [userId]
    );

    // This week's stats
    const weekStats = await get(
      `SELECT 
        COUNT(*) as week_sales,
        SUM(amount) as week_revenue
      FROM sales 
      WHERE user_id = ? AND DATE(created_at) >= DATE('now', '-7 days')`,
      [userId]
    );

    // This month's stats
    const monthStats = await get(
      `SELECT 
        COUNT(*) as month_sales,
        SUM(amount) as month_revenue
      FROM sales 
      WHERE user_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`,
      [userId]
    );

    // Top selling items
    const topItems = await query(
      `SELECT 
        item_name,
        SUM(quantity) as total_quantity,
        SUM(amount) as total_revenue,
        COUNT(*) as sale_count
      FROM sales 
      WHERE user_id = ?
      GROUP BY item_name
      ORDER BY total_revenue DESC
      LIMIT 5`,
      [userId]
    );

    // Recent sales
    const recentSales = await query(
      'SELECT * FROM sales WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.json({
      success: true,
      data: {
        overall: overallStats,
        today: todayStats,
        week: weekStats,
        month: monthStats,
        top_items: topItems,
        recent_sales: recentSales
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const sales = await query(
      `SELECT * FROM sales 
       WHERE user_id = ? 
       AND DATE(created_at) >= DATE(?) 
       AND DATE(created_at) <= DATE(?)
       ORDER BY created_at DESC`,
      [userId, startDate, endDate]
    );

    const stats = await get(
      `SELECT 
        COUNT(*) as total_sales,
        SUM(amount) as total_revenue,
        AVG(amount) as average_sale
      FROM sales 
      WHERE user_id = ? 
      AND DATE(created_at) >= DATE(?) 
      AND DATE(created_at) <= DATE(?)`,
      [userId, startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        sales,
        stats
      }
    });
  } catch (error) {
    console.error('Get sales by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales'
    });
  }
};
