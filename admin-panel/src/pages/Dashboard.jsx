import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp, 
  FiLogOut, FiRefreshCw, FiTrash2, FiEye, FiShield,
  FiActivity, FiDatabase, FiBarChart2
} from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Dashboard({ admin, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    activeToday: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch all users
      const usersRes = await axios.get(`${API_URL}/api/admin/users`, config);
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      // Fetch platform stats
      const statsRes = await axios.get(`${API_URL}/api/admin/stats`, config);
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        onLogout();
      } else {
        toast.error('Failed to load data');
      }
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiShield className="text-red-500 text-2xl mr-3" />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">{admin.email}</span>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <FiRefreshCw />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <FiUsers className="text-blue-500 text-3xl" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  KES {stats.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <FiDollarSign className="text-green-500 text-3xl" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Transactions</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalTransactions || 0}</p>
              </div>
              <FiShoppingBag className="text-purple-500 text-3xl" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Today</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.activeToday || 0}</p>
              </div>
              <FiActivity className="text-orange-500 text-3xl" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                All Users ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Platform Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <FiDatabase className="mr-2" />
                      System Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Database</span>
                        <span className="text-green-400">● Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">API Server</span>
                        <span className="text-green-400">● Running</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Users</span>
                        <span className="text-white">{users.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <FiBarChart2 className="mr-2" />
                      Quick Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admin Users</span>
                        <span className="text-white">
                          {users.filter(u => u.role === 'admin').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Regular Users</span>
                        <span className="text-white">
                          {users.filter(u => u.role !== 'admin').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Revenue</span>
                        <span className="text-white">KES {stats.totalRevenue?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">All Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Business</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4 text-white">{user.email}</td>
                          <td className="py-3 px-4 text-gray-300">{user.business_name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete user"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
