import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiTrendingDown, 
  FiSearch, FiDownload, FiUpload, FiBarChart2, FiClock, FiTrendingUp,
  FiShoppingCart, FiDollarSign, FiCalendar, FiFilter, FiRefreshCw,
  FiEye, FiGrid, FiList, FiStar, FiBox, FiTruck, FiCheckCircle
} from 'react-icons/fi';
import { inventoryAPI, salesAPI } from '../utils/api';
import AlertsCenter from '../components/AlertsCenter';
import WeeklyInsights from '../components/WeeklyInsights';

const Inventory = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('name'); // name, quantity, value, status
  const [showAlerts, setShowAlerts] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recentSalesCount, setRecentSalesCount] = useState(0);

  const categories = ['All', 'Grains', 'Oils', 'Vegetables', 'Meat', 'Spices', 'Beverages', 'Dairy', 'Frozen', 'Bakery'];
  
  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        inventoryAPI.getAll(),
        salesAPI.getStats()
      ]);

      // Set inventory
      if (results[0].status === 'fulfilled') {
        setInventory(results[0].value.data || []);
      } else {
        console.error('Error fetching inventory:', results[0].reason);
        toast.error('Failed to load inventory');
      }
      
      // Fetch recent sales count
      if (results[1].status === 'fulfilled') {
        setRecentSalesCount(results[1].value.data.week?.week_sales || 0);
      } else {
        console.error('Error fetching sales stats:', results[1].reason);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock);
  const criticalStockItems = inventory.filter(item => item.quantity <= item.min_stock * 0.5);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);
  
  // Calculate expiring soon (within 30 days) - if expiry_date field exists
  const expiringSoon = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  // Sort and filter inventory
  let filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Apply sorting
  filteredInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quantity':
        return b.quantity - a.quantity;
      case 'value':
        return (b.quantity * b.price) - (a.quantity * a.price);
      case 'status':
        const getStatusPriority = (item) => {
          if (item.quantity === 0) return 0;
          if (item.quantity <= item.min_stock * 0.5) return 1;
          if (item.quantity <= item.min_stock) return 2;
          return 3;
        };
        return getStatusPriority(a) - getStatusPriority(b);
      default:
        return 0;
    }
  });

  const handleAddItem = async (formData) => {
    try {
      await inventoryAPI.create(formData);
      toast.success('Item added to inventory!');
      setShowAddModal(false);
      fetchInventory(); // Refresh
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item: ' + error.message);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (formData) => {
    try {
      await inventoryAPI.update(editingItem.id, formData);
      toast.success('Item updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
      fetchInventory(); // Refresh
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item: ' + error.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.delete(id);
        toast.success('Item removed from inventory!');
        fetchInventory(); // Refresh
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item: ' + error.message);
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.min_stock * 0.5) return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critical' };
    if (item.quantity <= item.min_stock) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Low' };
    return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Good' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar user={user} />
        <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />
      
      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Inventory Management</h1>
              <p className="text-gray-400 text-sm">Enterprise-grade stock control & analytics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAlerts(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/30"
              >
                <FiAlertTriangle />
                <span className="hidden sm:inline">Alerts</span>
                {(criticalStockItems.length + expiringSoon.length) > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {criticalStockItems.length + expiringSoon.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowInsights(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all border border-blue-500/30"
              >
                <FiBarChart2 />
                <span className="hidden sm:inline">Insights</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 md:p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <FiPackage className="text-2xl text-blue-500" />
              <span className="text-xs text-blue-400 font-medium">TOTAL</span>
            </div>
            <p className="text-white text-3xl font-bold mb-1">{inventory.length}</p>
            <p className="text-blue-400 text-sm">Items in stock</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 md:p-6 border border-red-500/30 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <FiAlertTriangle className="text-2xl text-red-500" />
              <span className="text-xs text-red-400 font-medium">CRITICAL</span>
            </div>
            <p className="text-white text-3xl font-bold mb-1">{criticalStockItems.length}</p>
            <p className="text-red-400 text-sm">Critical stock</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 md:p-6 border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="text-2xl text-yellow-500" />
              <span className="text-xs text-yellow-400 font-medium">EXPIRING</span>
            </div>
            <p className="text-white text-3xl font-bold mb-1">{expiringSoon.length}</p>
            <p className="text-yellow-400 text-sm">Within 30 days</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 md:p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="text-2xl text-green-500" />
              <span className="text-xs text-green-400 font-medium">VALUE</span>
            </div>
            <p className="text-white text-2xl font-bold mb-1">KES {(totalValue / 1000).toFixed(1)}K</p>
            <p className="text-green-400 text-sm">Total inventory</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 md:p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-2xl text-purple-500" />
              <span className="text-xs text-purple-400 font-medium">TURNOVER</span>
            </div>
            <p className="text-white text-3xl font-bold mb-1">{recentSalesCount}</p>
            <p className="text-purple-400 text-sm">Sales (7 days)</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-yellow-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-500 font-bold mb-1">Low Stock Alert!</h3>
                <p className="text-gray-300 text-sm">
                  {lowStockItems.length} item(s) need restocking: {lowStockItems.map(i => i.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="name">Sort by Name</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="value">Sort by Value</option>
                <option value="status">Sort by Status</option>
              </select>
              <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiList size={20} />
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg font-medium"
              >
                <FiPlus />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Min Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden xl:table-cell">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs md:hidden">{item.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{item.quantity}</span>
                        <span className="text-gray-400 text-sm ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden lg:table-cell">{item.min_stock} {item.unit}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden xl:table-cell">KES {item.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <InventoryFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
          categories={categories.slice(1)}
        />
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <InventoryFormModal
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleUpdateItem}
          categories={categories.slice(1)}
          initialData={editingItem}
          isEdit={true}
        />
      )}

      {/* Alerts Center */}
      {showAlerts && <AlertsCenter onClose={() => setShowAlerts(false)} />}

      {/* Weekly Insights */}
      {showInsights && <WeeklyInsights onClose={() => setShowInsights(false)} />}
    </div>
  );
};

// Inventory Form Modal Component
const InventoryFormModal = ({ onClose, onSubmit, categories, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    category: 'Grains',
    quantity: '',
    unit: 'kg',
    min_stock: '',
    price: '',
    supplier: '',
    last_restocked: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseFloat(formData.quantity),
      min_stock: parseFloat(formData.min_stock),
      price: parseFloat(formData.price)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Item Name"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              min="0"
              step="0.1"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Unit (kg, liters, bags)"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <input
            type="number"
            name="min_stock"
            value={formData.min_stock}
            onChange={handleChange}
            placeholder="Minimum Stock Level"
            min="0"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price per Unit (KES)"
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Supplier (optional)"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="date"
            name="last_restocked"
            value={formData.last_restocked}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg"
            >
              {isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;

