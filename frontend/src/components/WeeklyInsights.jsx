import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
  FiPackage, FiTarget, FiAward, FiAlertCircle, FiBarChart2,
  FiPieChart, FiActivity, FiClock, FiX, FiDownload
} from 'react-icons/fi';
import { SalesStorage, InventoryStorage, ExpensesStorage } from '../utils/storage';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const WeeklyInsights = ({ onClose }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = () => {
    const sales = SalesStorage.load();
    const inventory = InventoryStorage.load();
    const expenses = ExpensesStorage.load();

    // Get last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Filter data for last week
    const weeklySales = sales.filter(s => new Date(s.created_at) >= sevenDaysAgo);
    const weeklyExpenses = expenses.filter(e => new Date(e.created_at) >= sevenDaysAgo);

    // Calculate daily data
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const daySales = weeklySales.filter(s => {
        const saleDate = new Date(s.created_at);
        return saleDate >= date && saleDate < nextDate;
      });

      const dayExpenses = weeklyExpenses.filter(e => {
        const expenseDate = new Date(e.created_at);
        return expenseDate >= date && expenseDate < nextDate;
      });

      const salesAmount = daySales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const expensesAmount = dayExpenses.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);

      dailyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: salesAmount,
        expenses: expensesAmount,
        profit: salesAmount - expensesAmount,
        transactions: daySales.length
      });
    }

    // Calculate totals
    const totalSales = weeklySales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);
    const totalProfit = totalSales - totalExpenses;
    const avgDailySales = totalSales / 7;
    const avgDailyProfit = totalProfit / 7;

    // Find best and worst days
    const bestDay = dailyData.reduce((max, day) => day.sales > max.sales ? day : max, dailyData[0]);
    const worstDay = dailyData.reduce((min, day) => day.sales < min.sales ? day : min, dailyData[0]);

    // Top selling items
    const itemSales = {};
    weeklySales.forEach(sale => {
      if (sale.item_name) {
        if (!itemSales[sale.item_name]) {
          itemSales[sale.item_name] = { quantity: 0, revenue: 0 };
        }
        itemSales[sale.item_name].quantity += sale.quantity || 1;
        itemSales[sale.item_name].revenue += sale.amount || 0;
      }
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Expense breakdown
    const expenseCategories = {};
    weeklyExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      expenseCategories[category] = (expenseCategories[category] || 0) + Math.abs(expense.amount || 0);
    });

    const expenseData = Object.entries(expenseCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Growth comparison (compare to previous week)
    const twoWeeksAgo = new Date(sevenDaysAgo);
    twoWeeksAgo.setDate(sevenDaysAgo.getDate() - 7);

    const previousWeekSales = sales.filter(s => {
      const saleDate = new Date(s.created_at);
      return saleDate >= twoWeeksAgo && saleDate < sevenDaysAgo;
    });

    const previousWeekTotal = previousWeekSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const growthRate = previousWeekTotal > 0 
      ? ((totalSales - previousWeekTotal) / previousWeekTotal * 100).toFixed(1)
      : 0;

    // Inventory insights
    const lowStockCount = inventory.filter(item => item.quantity <= item.min_stock).length;
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Generate recommendations
    const recommendations = [];

    if (totalProfit < 0) {
      recommendations.push({
        type: 'critical',
        title: 'Negative Profit',
        message: 'Your expenses exceeded sales this week. Consider reducing costs or increasing prices.',
        icon: <FiAlertCircle />
      });
    }

    if (lowStockCount > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockCount} items are running low. Restock to avoid lost sales.`,
        icon: <FiPackage />
      });
    }

    if (parseFloat(growthRate) > 10) {
      recommendations.push({
        type: 'success',
        title: 'Strong Growth',
        message: `Sales increased by ${growthRate}% compared to last week. Keep it up!`,
        icon: <FiTrendingUp />
      });
    } else if (parseFloat(growthRate) < -10) {
      recommendations.push({
        type: 'warning',
        title: 'Declining Sales',
        message: `Sales decreased by ${Math.abs(growthRate)}% from last week. Review your strategy.`,
        icon: <FiTrendingDown />
      });
    }

    if (bestDay && worstDay) {
      const difference = bestDay.sales - worstDay.sales;
      if (difference > avgDailySales) {
        recommendations.push({
          type: 'info',
          title: 'Sales Volatility',
          message: `${bestDay.day} performed ${((difference / worstDay.sales) * 100).toFixed(0)}% better than ${worstDay.day}. Analyze what worked.`,
          icon: <FiBarChart2 />
        });
      }
    }

    setInsights({
      dailyData,
      totalSales,
      totalExpenses,
      totalProfit,
      avgDailySales,
      avgDailyProfit,
      bestDay,
      worstDay,
      topItems,
      expenseData,
      growthRate,
      lowStockCount,
      totalInventoryValue,
      recommendations,
      transactionCount: weeklySales.length
    });

    setLoading(false);
  };

  const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

  const COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

  if (loading || !insights) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-white mt-4">Generating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-7xl shadow-2xl my-8">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <FiBarChart2 className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Weekly Business Insights</h2>
                  <p className="text-gray-400 text-sm">Last 7 days performance analysis</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm font-medium">Total Sales</span>
                  <FiDollarSign className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(insights.totalSales)}</p>
                <p className="text-xs text-green-400">{insights.transactionCount} transactions</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-sm font-medium">Net Profit</span>
                  {insights.totalProfit >= 0 ? (
                    <FiTrendingUp className="text-blue-500" size={24} />
                  ) : (
                    <FiTrendingDown className="text-red-500" size={24} />
                  )}
                </div>
                <p className={`text-3xl font-bold mb-1 ${insights.totalProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(insights.totalProfit)}
                </p>
                <p className="text-xs text-blue-400">
                  {insights.totalSales > 0 ? ((insights.totalProfit / insights.totalSales) * 100).toFixed(1) : 0}% margin
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm font-medium">Growth Rate</span>
                  {parseFloat(insights.growthRate) >= 0 ? (
                    <FiTrendingUp className="text-purple-500" size={24} />
                  ) : (
                    <FiTrendingDown className="text-red-500" size={24} />
                  )}
                </div>
                <p className={`text-3xl font-bold mb-1 ${parseFloat(insights.growthRate) >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {insights.growthRate}%
                </p>
                <p className="text-xs text-purple-400">vs last week</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-sm font-medium">Avg Daily Sales</span>
                  <FiActivity className="text-orange-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(insights.avgDailySales)}</p>
                <p className="text-xs text-orange-400">per day</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Performance Chart */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiBarChart2 className="text-orange-500" />
                  Daily Performance
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={insights.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#F97316" name="Sales" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiPieChart className="text-orange-500" />
                  Expense Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={insights.expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {insights.expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products & Best/Worst Days */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Items */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiAward className="text-orange-500" />
                  Top Selling Items
                </h3>
                <div className="space-y-3">
                  {insights.topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <p className="text-green-500 font-bold">{formatCurrency(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Highlights */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiTarget className="text-orange-500" />
                  Performance Highlights
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FiTrendingUp className="text-green-500" />
                      <span className="text-green-400 font-medium">Best Day</span>
                    </div>
                    <p className="text-white font-bold text-xl">{insights.bestDay.day}, {insights.bestDay.date}</p>
                    <p className="text-green-400 text-sm">{formatCurrency(insights.bestDay.sales)} in sales</p>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FiTrendingDown className="text-red-500" />
                      <span className="text-red-400 font-medium">Needs Improvement</span>
                    </div>
                    <p className="text-white font-bold text-xl">{insights.worstDay.day}, {insights.worstDay.date}</p>
                    <p className="text-red-400 text-sm">{formatCurrency(insights.worstDay.sales)} in sales</p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FiPackage className="text-blue-500" />
                      <span className="text-blue-400 font-medium">Inventory Status</span>
                    </div>
                    <p className="text-white font-bold text-xl">{formatCurrency(insights.totalInventoryValue)}</p>
                    <p className="text-blue-400 text-sm">
                      {insights.lowStockCount > 0 ? `${insights.lowStockCount} items low stock` : 'All items in stock'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiTarget className="text-orange-500" />
                  AI-Powered Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        rec.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        rec.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.type === 'critical' ? 'bg-red-500/20 text-red-500' :
                          rec.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                          rec.type === 'success' ? 'bg-green-500/20 text-green-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {rec.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-300">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <button
              onClick={() => {/* Export functionality */}}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors border border-orange-500/30"
            >
              <FiDownload />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyInsights;
