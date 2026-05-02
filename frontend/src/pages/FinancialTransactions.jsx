import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiPieChart, FiZap, FiCreditCard } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CashflowPredictions from '../components/CashflowPredictions';
import MpesaPayment from '../components/MpesaPayment';
import { transactionsAPI } from '../utils/api';
import { toast } from 'react-toastify';

const FinancialTransactions = () => {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState('week');
  const [transactionType, setTransactionType] = useState('all');
  const [showCashflow, setShowCashflow] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load actual transactions from API
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionsAPI.getAll();
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Calculate totals from actual data
  const totalIncome = transactions.filter(t => t.type === 'income' || t.type === 'payment').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  // No demo chart data - will be calculated from actual transactions
  const dailyData = [];
  const categoryData = [];

  const filteredTransactions = transactions.filter(t => {
    if (transactionType === 'all') return true;
    if (transactionType === 'income') return t.type === 'income' || t.type === 'payment';
    return t.type === transactionType;
  });

  const hasData = transactions.length > 0;

  // Refresh transactions after payment
  const handlePaymentSuccess = async (payment) => {
    try {
      await transactionsAPI.create(payment);
      toast.success('Payment recorded successfully!');
      setShowPayment(false);
      
      // Refresh transactions
      const response = await transactionsAPI.getAll();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar user={user} />
        <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading transactions...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Financial Transactions</h1>
              <p className="text-gray-400">Track your income, expenses, and profitability</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCashflow(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/30"
              >
                <FiZap />
                <span className="hidden sm:inline">Cashflow AI</span>
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all shadow-lg"
              >
                <FiCreditCard />
                <span className="hidden sm:inline">M-Pesa Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-2xl text-green-500" />
              <span className="text-green-500 text-sm font-medium">+12.5%</span>
            </div>
            <p className="text-gray-400 text-sm">Total Income</p>
            <p className="text-white text-2xl font-bold">KES {totalIncome.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingDown className="text-2xl text-red-500" />
              <span className="text-red-500 text-sm font-medium">-8.3%</span>
            </div>
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <p className="text-white text-2xl font-bold">KES {totalExpenses.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="text-2xl text-blue-500" />
              <span className="text-blue-500 text-sm font-medium">↑</span>
            </div>
            <p className="text-gray-400 text-sm">Net Profit</p>
            <p className="text-white text-2xl font-bold">KES {netProfit.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <FiPieChart className="text-2xl text-purple-500" />
            </div>
            <p className="text-gray-400 text-sm">Profit Margin</p>
            <p className="text-white text-2xl font-bold">{profitMargin}%</p>
          </div>
        </div>

        {/* Charts Section */}
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Income vs Expenses Chart */}
            {dailyData.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
                <h3 className="text-white font-bold text-lg mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Expense Breakdown */}
            {categoryData.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6">
                <h3 className="text-white font-bold text-lg mb-4">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-6 text-center">
            <FiDollarSign className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400 mb-2">No financial data yet</p>
            <p className="text-gray-500 text-sm">Start recording transactions to see charts and analytics</p>
          </div>
        )}

        {/* Filters and Export */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg whitespace-nowrap">
              <FiDownload />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-bold text-lg">Recent Transactions</h3>
          </div>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden sm:table-cell">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                        {new Date(transaction.created_at || transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium text-sm">{transaction.description}</p>
                          <p className="text-gray-400 text-xs md:hidden">{transaction.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm hidden md:table-cell">{transaction.category || 'Uncategorized'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'income' || transaction.type === 'payment'
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {transaction.type === 'income' || transaction.type === 'payment' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        transaction.type === 'income' || transaction.type === 'payment' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' || transaction.type === 'payment' ? '+' : '-'}KES {Math.abs(transaction.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FiDollarSign className="mx-auto text-gray-600 mb-3" size={40} />
              <p className="text-gray-400">No transactions found</p>
              <p className="text-gray-500 text-sm mt-1">Record your first transaction to get started</p>
            </div>
          )}
        </div>

        {/* Cashflow Predictions Modal */}
        {showCashflow && <CashflowPredictions onClose={() => setShowCashflow(false)} />}

        {/* M-Pesa Payment Modal */}
        {showPayment && (
          <MpesaPayment
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialTransactions;

