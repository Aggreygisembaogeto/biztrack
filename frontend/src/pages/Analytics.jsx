import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, FiUsers, FiCalendar } from 'react-icons/fi';
import { salesAPI, transactionsAPI } from '../utils/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, transactionsRes] = await Promise.all([
          salesAPI.getAll(),
          transactionsAPI.getAll()
        ]);
        
        setSales(salesRes.data || []);
        setTransactions(transactionsRes.data || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, period]);

  // Calculate KPIs from actual data
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalOrders = sales.length;
  const uniqueCustomers = new Set(sales.map(s => s.customer_phone).filter(Boolean)).size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // No demo data - all arrays empty until user has actual data
  const weeklyRevenue = [];
  const monthlyData = [];
  const topItems = [];
  const paymentMethods = [];
  const kpis = [
    { label: 'Revenue This Week', value: `KES ${totalRevenue.toLocaleString()}`, change: '+0%', up: true, icon: <FiDollarSign /> },
    { label: 'Orders This Week', value: totalOrders.toString(), change: '+0%', up: true, icon: <FiShoppingCart /> },
    { label: 'New Customers', value: uniqueCustomers.toString(), change: '+0%', up: true, icon: <FiUsers /> },
    { label: 'Avg Order Value', value: `KES ${Math.round(avgOrderValue).toLocaleString()}`, change: '0%', up: false, icon: <FiTrendingUp /> },
  ];

  const hasData = sales.length > 0 || transactions.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar user={user} />
        <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Business performance overview</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  period === p
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">{kpi.icon}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  kpi.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-1">{kpi.label}</p>
              <p className="text-white text-xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue vs Expenses vs Profit */}
        {hasData && weeklyRevenue.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Revenue, Expenses & Profit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" name="Revenue" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#f97316" fill="url(#profGrad)" name="Profit" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-6 text-center">
            <FiTrendingUp className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400 mb-2">No analytics data yet</p>
            <p className="text-gray-500 text-sm">Start recording sales and expenses to see analytics</p>
          </div>
        )}

        {/* Bottom Row - Hidden until data exists */}
        {hasData && (topItems.length > 0 || paymentMethods.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Top Selling Items */}
            {topItems.length > 0 && (
              <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
                <h3 className="text-white font-bold text-lg mb-4">Top Selling Items</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={v => [`KES ${v.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {topItems.map((item, i) => (
                        <Cell key={i} fill={item.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
                <h3 className="text-white font-bold text-lg mb-4">Payment Methods</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {paymentMethods.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={v => [`${v}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {paymentMethods.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-gray-300">{m.name}</span>
                      </div>
                      <span className="text-white font-semibold">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly Trend - Hidden until data exists */}
        {hasData && monthlyData.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
            <h3 className="text-white font-bold text-lg mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
};

export default Analytics;

