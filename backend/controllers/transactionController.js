const { query, run, get } = require('../config/database-production');

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, description, category, customer_phone, payment_method, status = 'completed' } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide amount and type' 
      });
    }

    if (!['sale', 'expense', 'order', 'payment'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be one of: sale, expense, order, payment' 
      });
    }

    // Create transaction
    const result = await run(
      `INSERT INTO transactions (user_id, amount, type, status, description, category, customer_phone, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, amount, type, status, description, category, customer_phone, payment_method]
    );

    const transaction = await get(
      'SELECT * FROM transactions WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating transaction' 
    });
  }
};

// Get all transactions for user
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, status, type, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
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

    const transactions = await query(sql, params);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching transactions' 
    });
  }
};

// Get summary statistics
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Today's revenue (completed transactions)
    const todayRevenue = await get(
      `SELECT COALESCE(SUM(amount), 0) as revenue 
       FROM transactions 
       WHERE user_id = ? 
       AND status = 'completed' 
       AND DATE(created_at) = DATE('now')`,
      [userId]
    );

    // Today's transaction count
    const todayTransactions = await get(
      `SELECT COUNT(*) as count 
       FROM transactions 
       WHERE user_id = ? 
       AND DATE(created_at) = DATE('now')`,
      [userId]
    );

    // Total revenue (all time)
    const totalRevenue = await get(
      `SELECT COALESCE(SUM(amount), 0) as revenue 
       FROM transactions 
       WHERE user_id = ? 
       AND status = 'completed'`,
      [userId]
    );

    // Total transactions (all time)
    const totalTransactions = await get(
      `SELECT COUNT(*) as count 
       FROM transactions 
       WHERE user_id = ?`,
      [userId]
    );

    // Recent transactions (last 10)
    const recentTransactions = await query(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        today: {
          revenue: parseFloat(todayRevenue.revenue || 0),
          transactions: parseInt(todayTransactions.count || 0)
        },
        total: {
          revenue: parseFloat(totalRevenue.revenue || 0),
          transactions: parseInt(totalTransactions.count || 0)
        },
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching summary' 
    });
  }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await get(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, type, description, category, customer_phone, payment_method, status } = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await get(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await run(
      `UPDATE transactions SET
        amount = ?,
        type = ?,
        description = ?,
        category = ?,
        customer_phone = ?,
        payment_method = ?,
        status = ?
      WHERE id = ? AND user_id = ?`,
      [
        amount !== undefined ? amount : existingTransaction.amount,
        type !== undefined ? type : existingTransaction.type,
        description !== undefined ? description : existingTransaction.description,
        category !== undefined ? category : existingTransaction.category,
        customer_phone !== undefined ? customer_phone : existingTransaction.customer_phone,
        payment_method !== undefined ? payment_method : existingTransaction.payment_method,
        status !== undefined ? status : existingTransaction.status,
        id,
        userId
      ]
    );

    const updatedTransaction = await get(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if transaction exists and belongs to user
    const existingTransaction = await get(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await run(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
};

// Get transaction statistics by type
exports.getStatsByType = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await query(
      `SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM transactions 
      WHERE user_id = ?
      GROUP BY type`,
      [userId]
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Get transaction statistics by category
exports.getStatsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await query(
      `SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = ? AND category IS NOT NULL
      GROUP BY category
      ORDER BY total_amount DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
