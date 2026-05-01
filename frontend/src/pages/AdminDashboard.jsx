import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../utils/api';
import { 
  FiUsers, FiActivity, FiDatabase, FiShield, FiTrendingUp, 
  FiDollarSign, FiPackage, FiShoppingBag, FiLogOut, FiMenu, FiX,
  FiBarChart2, FiSettings, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Admin data
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    activeUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!user) {
      toast.error('Please login to access Admin Dashboard');
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, isAdmin, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes, activityRes] = await Promise.allSettled([
        adminAPI.getPlatformStats(),
        adminAPI.getAllUsers(),
        adminAPI.getRecentActivity(20)
      ]);

      if (statsRes.status === 'fulfilled') {
        setPlatformStats(statsRes.value.data || {});
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data || []);
      }

      if (activityRes.status === 'fulfilled') {
        setRecentActivity(activityRes.value.data || []);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-red-900 border-b border-red-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <FiShield className="text-red-400 text-2xl mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-red-300">System Administration</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-red-800 text-white'
                    : 'text-red-200 hover:bg-red-800/50'
                }`}
              >
                <FiBarChart2 className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-red-800 text-white'
                    : 'text-red-200 hover:bg-red-800/50'
                }`}
              >
                <FiUsers className="inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-red-800 text-white'
                    : 'text-red-200 hover:bg-red-800/50'
                }`}
              >
                <FiActivity className="inline mr-2" />
                Activity
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">{user.business_name}</p>
                <p className="text-xs text-red-300">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-red-800 border-t border-red-700">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-white hover:bg-red-700 rounded"
              >
                Overview
              </button>
              <button
                onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-white hover:bg-red-700 rounded"
              >
                Users
              </button>
              <button
                onClick={() => { setActiveTab('activity'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-white hover:bg-red-700 rounded"
              >
                Activity
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="text-blue-400 text-3xl" />
                  <span className="text-xs text-gray-400">TOTAL</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{platformStats.totalUsers || 0}</h3>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <FiDollarSign className="text-green-400 text-3xl" />
                  <span className="text-xs text-gray-400">REVENUE</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  KES {(platformStats.totalRevenue || 0).toLocaleString()}
                </h3>
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <FiShoppingBag className="text-purple-400 text-3xl" />
                  <span className="text-xs text-gray-400">TRANSACTIONS</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {platformStats.totalTransactions || 0}
                </h3>
                <p className="text-sm text-gray-400">Total Transactions</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="text-orange-400 text-3xl" />
                  <span className="text-xs text-gray-400">ACTIVE</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {platformStats.activeUsers || 0}
                </h3>
                <p className="text-sm text-gray-400">Active Today</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database</span>
                  <span className="flex items-center text-green-400">
                    <FiCheckCircle className="mr-2" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Server</span>
                  <span className="flex items-center text-green-400">
                    <FiCheckCircle className="mr-2" />
                    Running
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Storage</span>
                  <span className="text-white">SQLite Database</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">All Users</h2>
              <span className="text-gray-400">{users.length} total users</span>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{u.business_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            u.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-700 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <FiActivity className="text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{activity.description}</p>
                        <p className="text-sm text-gray-400">{activity.user_email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
