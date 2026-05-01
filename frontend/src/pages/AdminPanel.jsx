import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../utils/api';
import { 
  FiUsers, FiActivity, FiDatabase, FiShield, FiTrendingUp, 
  FiDollarSign, FiPackage, FiShoppingBag, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiTrash2, FiEye,
  FiRefreshCw, FiDownload, FiSearch, FiFilter, FiBarChart2,
  FiLogOut, FiHome, FiMenu, FiX
} from 'react-icons/fi';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Check if user is super admin (strict check)
  const isSuperAdmin = user && (
    user.email === 'admin@biztrack.com' || 
    user.role === 'admin'
  );

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access Admin Panel.');
      navigate('/login');
      return;
    }
    
    if (!isSuperAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
  }, [user, navigate, isSuperAdmin]);

  // Fetch admin data from API
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        adminAPI.getAllUsers(),
        adminAPI.getPlatformStats(),
        adminAPI.getRecentActivity(20)
      ]);

      // Set users
      if (results[0].status === 'fulfilled') {
        setUsers(results[0].value.data || []);
      } else {
        console.error('Failed to fetch users:', results[0].reason);
        toast.error('Failed to load users');
      }

      // Set platform stats
      if (results[1].status === 'fulfilled') {
        setPlatformStats(results[1].value.data || null);
      } else {
        console.error('Failed to fetch platform stats:', results[1].reason);
        toast.error('Failed to load platform statistics');
      }

      // Set recent activity
      if (results[2].status === 'fulfilled') {
        setRecentActivity(results[2].value.data || []);
      } else {
        console.error('Failed to fetch recent activity:', results[2].reason);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchAdminData();
    }
  }, [user, isSuperAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'suspend':
          // Note: Suspend functionality not implemented in backend yet
          // For now, just show a message
          toast.warning('Suspend functionality coming soon');
          break;
          
        case 'activate':
          // Note: Activate functionality not implemented in backend yet
          toast.warning('Activate functionality coming soon');
          break;
          
        case 'delete':
          if (window.confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchAdminData(); // Refresh data
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error('Failed to perform action: ' + error.message);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminAPI.getUserDetails(userId);
      const userData = response.data;
      toast.info(`Viewing details for ${userData.user.business_name}`);
      // You can add a modal here to show full user details
    } catch (error) {
      console.error('Error viewing user:', error);
      toast.error('Failed to load user details');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biztrack-users-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('User data exported successfully');
  };

  // Calculate stats from API data
  const stats = platformStats ? {
    totalUsers: platformStats.overview?.total_users || 0,
    activeUsers: platformStats.overview?.total_businesses || 0,
    suspendedUsers: 0, // Not tracked yet
    totalRevenue: platformStats.overview?.platform_revenue || 0,
    totalOrders: platformStats.overview?.total_orders || 0,
    totalInventoryItems: platformStats.overview?.total_inventory_items || 0,
    newUsersToday: platformStats.overview?.new_users_today || 0,
    activeToday: platformStats.overview?.active_users_today || 0
  } : {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalInventoryItems: 0,
    newUsersToday: 0,
    activeToday: 0
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg shadow-red-500/20">
                <FiShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  BizTrack Admin
                </h1>
                <p className="text-xs text-gray-400">Platform Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all"
              >
                <FiHome size={18} />
                <span className="text-sm font-medium">My Business</span>
              </button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-700/30 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.business_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{user?.business_name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20"
              >
                <FiLogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all"
              >
                <FiHome size={18} />
                <span className="text-sm font-medium">My Business</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20"
              >
                <FiLogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/30 uppercase tracking-wide">
              Admin Access
            </span>
            <span className="text-gray-500 text-sm">
              Managing {stats.totalUsers} businesses
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Platform Dashboard</h2>
          <p className="text-gray-400">Monitor and manage all businesses on the platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Platform Overview', icon: <FiBarChart2 /> },
            { id: 'users', label: 'User Management', icon: <FiUsers /> },
            { id: 'analytics', label: 'Analytics', icon: <FiTrendingUp /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Businesses</span>
                  <FiUsers className="text-blue-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.newUsersToday} new today
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-green-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Businesses</span>
                  <FiCheckCircle className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeToday} active today
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-green-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Platform Revenue</span>
                  <FiDollarSign className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All businesses combined
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-orange-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Orders</span>
                  <FiShoppingBag className="text-orange-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Platform-wide
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <FiAlertCircle className="text-yellow-500" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Suspended</p>
                    <p className="text-2xl font-bold text-white">{stats.suspendedUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FiPackage className="text-purple-500" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Inventory</p>
                    <p className="text-2xl font-bold text-white">{stats.totalInventoryItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-green-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FiTrendingUp className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Revenue/Business</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(Math.round(stats.totalRevenue / stats.totalUsers))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Recent Platform Activity</span>
                <button
                  onClick={fetchAdminData}
                  className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FiRefreshCw size={16} className="text-gray-400" />
                </button>
              </h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          activity.type === 'sale' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          activity.type === 'order' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          {activity.type === 'sale' ? <FiDollarSign /> :
                           activity.type === 'order' ? <FiShoppingBag /> :
                           <FiUsers />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{activity.business}</p>
                          <p className="text-xs text-gray-400">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="text-sm font-medium text-white">{formatCurrency(activity.amount)}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search businesses by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors border border-green-500/30"
                  >
                    <FiDownload />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.business_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.business_name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-300">{user.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-gray-300 font-medium">{formatCurrency(user.totalSales || 0)}</p>
                            <p className="text-xs text-gray-500">{user.totalOrders || 0} orders</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-300">{formatDate(user.created_at)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded transition-colors"
                                title="Suspend Business"
                              >
                                <FiAlertCircle size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded transition-colors"
                                title="Activate Business"
                              >
                                <FiCheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                              title="Delete Business"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Top Revenue Generators</h4>
                  <div className="space-y-2">
                    {platformStats?.top_revenue_generators?.length > 0 ? (
                      platformStats.top_revenue_generators.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                            <span className="text-sm text-gray-300">{user.business_name}</span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(user.total_revenue || 0)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4 text-sm">No data available</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Most Active Businesses</h4>
                  <div className="space-y-2">
                    {platformStats?.most_active_businesses?.length > 0 ? (
                      platformStats.most_active_businesses.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                            <span className="text-sm text-gray-300">{user.business_name}</span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {user.order_count || 0} orders
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4 text-sm">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">API Server</span>
                  <span className="flex items-center gap-2 text-green-500">
                    <FiCheckCircle />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Database</span>
                  <span className="flex items-center gap-2 text-green-500">
                    <FiCheckCircle />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Storage</span>
                  <span className="flex items-center gap-2 text-green-500">
                    <FiCheckCircle />
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
