import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { FiShoppingBag, FiMessageSquare, FiPhone, FiMail, FiInstagram, FiPackage, FiCheck, FiX, FiClock, FiPlus, FiFilter } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTiktok } from 'react-icons/fa';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: <FaWhatsapp />, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'facebook', name: 'Facebook', icon: <FaFacebook />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'instagram', name: 'Instagram', icon: <FiInstagram />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, color: 'text-gray-300', bg: 'bg-gray-500/10' },
    { id: 'phone', name: 'Phone Call', icon: <FiPhone />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'email', name: 'Email', icon: <FiMail />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'walk-in', name: 'Walk-in', icon: <FiShoppingBag />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  const statusOptions = [
    { id: 'pending', name: 'Pending', icon: <FiClock />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'confirmed', name: 'Confirmed', icon: <FiCheck />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'preparing', name: 'Preparing', icon: <FiPackage />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'ready', name: 'Ready', icon: <FiCheck />, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'completed', name: 'Completed', icon: <FiCheck />, color: 'text-green-600', bg: 'bg-green-600/10' },
    { id: 'cancelled', name: 'Cancelled', icon: <FiX />, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    platform: 'whatsapp',
    items: '',
    total_amount: '',
    notes: '',
    status: 'pending'
  });

  const handleAddOrder = (e) => {
    e.preventDefault();
    
    const order = {
      id: Date.now(),
      ...newOrder,
      total_amount: parseFloat(newOrder.total_amount),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setOrders([order, ...orders]);
    toast.success(`Order from ${newOrder.customer_name} added successfully!`);
    
    // Reset form
    setNewOrder({
      customer_name: '',
      customer_phone: '',
      platform: 'whatsapp',
      items: '',
      total_amount: '',
      notes: '',
      status: 'pending'
    });
    setShowAddOrder(false);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
        : order
    ));
    toast.success('Order status updated!');
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(order => order.id !== orderId));
      toast.success('Order deleted!');
    }
  };

  const getPlatformInfo = (platformId) => {
    return platforms.find(p => p.id === platformId) || platforms[0];
  };

  const getStatusInfo = (statusId) => {
    return statusOptions.find(s => s.id === statusId) || statusOptions[0];
  };

  const filteredOrders = orders.filter(order => {
    const platformMatch = filterPlatform === 'all' || order.platform === filterPlatform;
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    return platformMatch && statusMatch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0)
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const openWhatsApp = (phone, orderDetails) => {
    const message = encodeURIComponent(
      `Hello! Your order has been received:\n\n${orderDetails}\n\nWe'll notify you when it's ready. Thank you!`
    );
    const cleanPhone = phone.replace(/\+/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />

      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Orders Management</h1>
            <p className="text-gray-400 text-sm">Track orders from WhatsApp, Facebook, Instagram, and more</p>
          </div>
          <button
            onClick={() => setShowAddOrder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg"
          >
            <FiPlus />
            Add Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Orders</span>
              <FiShoppingBag className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending</span>
              <FiClock className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <FiCheck className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Revenue</span>
              <FiShoppingBag className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">KES {stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-400" />
            <span className="text-white font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Platform</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Orders ({filteredOrders.length})</h2>
          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingBag className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 mb-4">No orders found</p>
                <button
                  onClick={() => setShowAddOrder(true)}
                  className="text-orange-500 hover:text-orange-400"
                >
                  Add your first order
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const platform = getPlatformInfo(order.platform);
                  const status = getStatusInfo(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${platform.bg}`}>
                            <span className={`${platform.color} text-xl`}>{platform.icon}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{order.customer_name}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                                {status.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{order.customer_phone}</p>
                            <p className="text-sm text-gray-300 mb-2">{order.items}</p>
                            {order.notes && (
                              <p className="text-xs text-gray-500 italic">Note: {order.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-white mb-1">
                            KES {order.total_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                          ))}
                        </select>

                        {order.platform === 'whatsapp' && (
                          <button
                            onClick={() => openWhatsApp(order.customer_phone, order.items)}
                            className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded text-sm transition-colors border border-green-500/30"
                          >
                            <FaWhatsapp className="inline mr-1" />
                            Message
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-sm transition-colors border border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Order</h2>
              <button
                onClick={() => setShowAddOrder(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleAddOrder} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={newOrder.customer_phone}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                  required
                  placeholder="254712345678"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
                <select
                  value={newOrder.platform}
                  onChange={(e) => setNewOrder({ ...newOrder, platform: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Order Items</label>
                <textarea
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                  required
                  placeholder="2x Rice, 1x Cooking Oil, 3x Tomatoes"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Total Amount (KES)</label>
                <input
                  type="number"
                  value={newOrder.total_amount}
                  onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
                  required
                  min="1"
                  placeholder="1500"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Special instructions or delivery address"
                  rows="2"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrder(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg"
                >
                  Add Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
