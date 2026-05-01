import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar,
  FiShoppingCart, FiCreditCard, FiPieChart, FiDownload,
  FiChevronLeft, FiChevronRight, FiFilter
} from 'react-icons/fi';
import { SalesStorage, ExpensesStorage } from '../utils/storage';
import { toast } from 'react-toastify';

const DailyTracker = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load data
  useEffect(() => {
    setSales(SalesStorage.load());
    setExpenses(ExpensesStorage.load());
  }, []);

  // Filter data by selected date
  const getFilteredData = () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let startDate = startOfDay;
    let endDate = endOfDay;

    if (viewMode === 'week') {
      // Get start of week (Sunday)
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      
      // Get end of week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewMode === 'month') {
      // Get start of month
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Get end of month
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    return { filteredSales, filteredExpenses, startDate, endDate };
  };

  const { filteredSales, filteredExpenses, startDate, endDate } = getFilteredData();

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;

  // Navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format date display
  const formatDateRange = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exportData = () => {
    const data = {
      period: formatDateRange(),
      viewMode,
      summary: {
        totalSales,
        totalExpenses,
        netProfit,
        profitMargin: `${profitMargin}%`
      },
      sales: filteredSales,
      expenses: filteredExpenses
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-tracker-${selectedDate.toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Data exported successfully');
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />

      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Daily Tracker</h1>
          <p className="text-gray-400 text-sm">Track your daily sales, expenses, and profit</p>
        </div>

        {/* Date Navigation */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Mode Selector */}
            <div className="flex gap-2">
              {['day', 'week', 'month'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg min-w-[250px] justify-center">
                <FiCalendar className="text-orange-500" />
                <span className="text-white font-medium text-sm">{formatDateRange()}</span>
              </div>

              <button
                onClick={() => navigateDate(1)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiChevronRight size={20} />
              </button>

              <button
                onClick={goToToday}
                className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors border border-orange-500/30 text-sm font-medium"
              >
                Today
              </button>

              <button
                onClick={exportData}
                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors border border-green-500/30"
                title="Export Data"
              >
                <FiDownload size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">Total Sales</span>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiShoppingCart className="text-green-500" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(totalSales)}</p>
            <p className="text-xs text-green-400">{filteredSales.length} transactions</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm font-medium">Total Expenses</span>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiCreditCard className="text-red-500" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-400">{filteredExpenses.length} transactions</p>
          </div>

          {/* Net Profit */}
          <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500/10 to-blue-600/10' : 'from-orange-500/10 to-orange-600/10'} rounded-xl border ${netProfit >= 0 ? 'border-blue-500/30' : 'border-orange-500/30'} p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'} text-sm font-medium`}>Net Profit</span>
              <div className={`p-2 ${netProfit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-lg`}>
                {netProfit >= 0 ? (
                  <FiTrendingUp className="text-blue-500" size={20} />
                ) : (
                  <FiTrendingDown className="text-orange-500" size={20} />
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(netProfit)}</p>
            <p className={`text-xs ${netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
              {netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>

          {/* Profit Margin */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">Profit Margin</span>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FiPieChart className="text-purple-500" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profitMargin}%</p>
            <p className="text-xs text-purple-400">
              {profitMargin > 0 ? 'Healthy' : profitMargin < 0 ? 'Negative' : 'Break-even'}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiShoppingCart className="text-green-500" />
                Sales
              </h3>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                {filteredSales.length} items
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredSales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No sales for this period</p>
                </div>
              ) : (
                filteredSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <p className="text-white font-medium">{sale.item_name}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(sale.created_at)} • {sale.quantity} {sale.unit || 'units'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">{formatCurrency(sale.amount)}</p>
                      <p className="text-xs text-gray-500">@{formatCurrency(sale.unit_price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiCreditCard className="text-red-500" />
                Expenses
              </h3>
              <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                {filteredExpenses.length} items
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCreditCard size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No expenses for this period</p>
                </div>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <p className="text-white font-medium">{expense.description || 'Expense'}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(expense.created_at)}
                        {expense.category && ` • ${expense.category}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-bold">{formatCurrency(Math.abs(expense.amount))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Sale</p>
              <p className="text-2xl font-bold text-white">
                {filteredSales.length > 0 ? formatCurrency(totalSales / filteredSales.length) : 'KES 0'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Expense</p>
              <p className="text-2xl font-bold text-white">
                {filteredExpenses.length > 0 ? formatCurrency(totalExpenses / filteredExpenses.length) : 'KES 0'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Transactions</p>
              <p className="text-2xl font-bold text-white">
                {filteredSales.length + filteredExpenses.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;
