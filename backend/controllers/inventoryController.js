const { query, run, get } = require('../config/database-production');

// Get all inventory items for a user
exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const items = await query(
      'SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
};

// Get single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const item = await get(
      'SELECT * FROM inventory WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item'
    });
  }
};

// Add new inventory item
exports.addInventoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      category,
      quantity,
      unit,
      min_stock,
      price,
      supplier,
      last_restocked
    } = req.body;

    // Validation
    if (!name || quantity === undefined || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, quantity, and price are required'
      });
    }

    const result = await run(
      `INSERT INTO inventory (
        user_id, name, category, quantity, unit, min_stock, price, supplier, last_restocked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        category || null,
        quantity,
        unit || 'units',
        min_stock || 0,
        price,
        supplier || null,
        last_restocked || null
      ]
    );

    const newItem = await get(
      'SELECT * FROM inventory WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item'
    });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const {
      name,
      category,
      quantity,
      unit,
      min_stock,
      price,
      supplier,
      last_restocked
    } = req.body;

    // Check if item exists and belongs to user
    const existingItem = await get(
      'SELECT * FROM inventory WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await run(
      `UPDATE inventory SET
        name = ?,
        category = ?,
        quantity = ?,
        unit = ?,
        min_stock = ?,
        price = ?,
        supplier = ?,
        last_restocked = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [
        name !== undefined ? name : existingItem.name,
        category !== undefined ? category : existingItem.category,
        quantity !== undefined ? quantity : existingItem.quantity,
        unit !== undefined ? unit : existingItem.unit,
        min_stock !== undefined ? min_stock : existingItem.min_stock,
        price !== undefined ? price : existingItem.price,
        supplier !== undefined ? supplier : existingItem.supplier,
        last_restocked !== undefined ? last_restocked : existingItem.last_restocked,
        itemId,
        userId
      ]
    );

    const updatedItem = await get(
      'SELECT * FROM inventory WHERE id = ?',
      [itemId]
    );

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item'
    });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    // Check if item exists and belongs to user
    const existingItem = await get(
      'SELECT * FROM inventory WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await run(
      'DELETE FROM inventory WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
};

// Update inventory quantity (for sales deduction)
exports.updateInventoryQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and operation are required'
      });
    }

    const item = await get(
      'SELECT * FROM inventory WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    let newQuantity;
    if (operation === 'add') {
      newQuantity = parseFloat(item.quantity) + parseFloat(quantity);
    } else if (operation === 'subtract') {
      newQuantity = parseFloat(item.quantity) - parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }

    await run(
      'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, itemId]
    );

    const updatedItem = await get(
      'SELECT * FROM inventory WHERE id = ?',
      [itemId]
    );

    res.json({
      success: true,
      message: 'Quantity updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quantity'
    });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await query(
      'SELECT * FROM inventory WHERE user_id = ? AND quantity <= min_stock ORDER BY quantity ASC',
      [userId]
    );

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock items'
    });
  }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await get(
      `SELECT 
        COUNT(*) as total_items,
        SUM(quantity * price) as total_value,
        COUNT(CASE WHEN quantity <= min_stock THEN 1 END) as low_stock_count
      FROM inventory 
      WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
