import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ActivityFeed from '../components/ActivityFeed';
import AIAssistant from '../components/AIAssistant';
import AIMarketAdvisor from '../components/AIMarketAdvisor';
import TransactionModal from '../components/TransactionModal';
import QuickActions from '../components/QuickActions';
import QuickActionModal from '../components/QuickActionModal';
import SalesBreakdown from '../components/SalesBreakdown';
import WarningsCard from '../components/WarningsCard';
import FilterBar from '../components/FilterBar';
import RevenueChart from '../components/RevenueChart';
import TransactionChart from '../components/TransactionChart';
import AlertsCenter from '../components/AlertsCenter';
import WeeklyInsights from '../components/WeeklyInsights';
import CashflowPredictions from '../components/CashflowPredictions';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiActivity, FiPercent, FiBell, FiBarChart2, FiZap } from 'react-icons/fi';
import { salesAPI, transactionsAPI, inventoryAPI, ordersAPI } from '../utils/api';
import DailySummaryModal from '../components/DailySummaryModal';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const Dashboard = () => {
  const { user } = useAuth();

  // State for API data
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    today: { revenue: 0, transactions: 0, avgTransaction: 0 },
    total: { revenue: 0, transactions: 0 },
    growth: { revenue: 0, transactions: 0 },
    recent_transactions: []
  });
  const [salesItems, setSalesItems] = useState([]);
  const [dashboardInventory, setDashboardInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [yesterdaySummary, setYesterdaySummary] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showCashflow, setShowCashflow] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: 'today',
    type: 'all',
    status: 'all'
  });

  // Calculate profit
  const totalRevenue = summary.today.revenue;
  const totalExpenses = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel with error handling for each
      const results = await Promise.allSettled([
        salesAPI.getStats(),
        transactionsAPI.getSummary(),
        inventoryAPI.getAll(),
        transactionsAPI.getAll({ type: 'expense', limit: 100 })
      ]);

      // Process sales stats
      const salesStatsRes = results[0];
      if (salesStatsRes.status === 'fulfilled') {
        const salesStats = salesStatsRes.value.data;
        const todayRevenue = salesStats.today?.today_revenue || 0;
        const todaySales = salesStats.today?.today_sales || 0;
        const totalRevenue = salesStats.overall?.total_revenue || 0;
        const totalSales = salesStats.overall?.total_sales || 0;

        // Process transactions summary
        const transactionsSummaryRes = results[1];
        let todayTransactions = 0;
        let totalTransactions = 0;
        let recentTransactions = [];

        if (transactionsSummaryRes.status === 'fulfilled') {
          const transactionsSummary = transactionsSummaryRes.value.data;
          todayTransactions = transactionsSummary.today?.transactions || 0;
          totalTransactions = transactionsSummary.total?.transactions || 0;
          recentTransactions = transactionsSummary.recent_transactions || [];
        }

        // Calculate growth (mock for now - would need historical data)
        const revenueGrowth = 12.5;
        const transactionsGrowth = 8.3;

        // Set summary
        setSummary({
          today: {
            revenue: todayRevenue,
            transactions: todayTransactions,
            avgTransaction: todayTransactions > 0 ? todayRevenue / todayTransactions : 0
          },
          total: {
            revenue: totalRevenue,
            transactions: totalTransactions
          },
          growth: {
            revenue: revenueGrowth,
            transactions: transactionsGrowth
          },
          recent_transactions: recentTransactions
        });

        // Set sales items
        setSalesItems(salesStats.recent_sales || []);
      } else {
        console.error('Failed to fetch sales stats:', salesStatsRes.reason);
      }

      // Set inventory
      const inventoryRes = results[2];
      if (inventoryRes.status === 'fulfilled') {
        setDashboardInventory(inventoryRes.value.data || []);
      } else {
        console.error('Failed to fetch inventory:', inventoryRes.reason);
      }

      // Set expenses
      const expensesRes = results[3];
      if (expensesRes.status === 'fulfilled') {
        setExpenses(expensesRes.value.data || []);
      } else {
        console.error('Failed to fetch expenses:', expensesRes.reason);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load some dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Daily summary notification (simplified for now)
  useEffect(() => {
    const lastShown = localStorage.getItem('lastDailySummaryShown');
    const today = new Date().toDateString();
    
    if (lastShown !== today && salesItems.length > 0) {
      // Calculate yesterday's summary from recent sales
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const yesterdaySales = salesItems.filter(sale => {
        const saleDate = new Date(sale.created_at).toDateString();
        return saleDate === yesterdayStr;
      });
      
      const yesterdayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.created_at).toDateString();
        return expenseDate === yesterdayStr;
      });
      
      const totalSales = yesterdaySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const totalExpenses = yesterdayExpenses.reduce((sum, exp) => sum + Math.abs(exp.amount || 0), 0);
      
      if (totalSales > 0 || totalExpenses > 0) {
        setYesterdaySummary({
          totalSales,
          totalExpenses,
          transactionCount: yesterdaySales.length,
          topItem: yesterdaySales[0]?.item_name || 'No sales',
          topItemQuantity: yesterdaySales[0]?.quantity || 0
        });
        setShowDailySummary(true);
        localStorage.setItem('lastDailySummaryShown', today);
      }
    }
  }, [salesItems, expenses]);

  const handleTransactionCreated = async (newTransaction) => {
    try {
      const amount = parseFloat(newTransaction.amount);
      
      // Save to API
      await transactionsAPI.create({
        type: newTransaction.type || 'payment',
        amount: amount,
        description: newTransaction.description,
        category: newTransaction.category,
        customer_phone: newTransaction.customer_phone,
        payment_method: newTransaction.payment_method,
        status: 'completed'
      });
      
      toast.success('Transaction created successfully!');
      setShowTransactionModal(false);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction: ' + error.message);
    }
  };

  const handleQuickActionSuccess = async (record) => {
    try {
      if (record.type === 'stock') {
        // Update inventory via API
        const inventoryItem = dashboardInventory.find(item => 
          item.name.toLowerCase() === record.item_name.toLowerCase()
        );
        
        if (inventoryItem) {
          await inventoryAPI.updateQuantity(inventoryItem.id, record.quantity, 'add');
          toast.success(`Stock updated: ${record.item_name}`);
        } else {
          toast.warning(`Item ${record.item_name} not found in inventory`);
        }
        
        // Refresh dashboard data
        fetchDashboardData();
        return;
      }

      if (record.type === 'sale') {
        // Create sale via API
        await salesAPI.create({
          item_name: record.item_name,
          quantity: parseFloat(record.quantity),
          unit: record.unit || 'units',
          unit_price: parseFloat(record.price),
          amount: parseFloat(record.amount),
          customer_phone: record.customerPhone,
          status: record.paymentStatus === 'completed' ? 'completed' : 'pending'
        });
        
        toast.success(`Sale recorded! Inventory automatically updated.`);
      } else if (record.type === 'expense') {
        // Create expense via API
        await transactionsAPI.create({
          type: 'expense',
          amount: parseFloat(record.amount),
          description: record.description,
          category: record.category,
          status: 'completed'
        });
        
        toast.success('Expense recorded successfully!');
      }

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error in quick action:', error);
      toast.error('Failed to complete action: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />

      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Welcome back, {user?.business_name}!
                  </h1>
                  <p className="text-gray-400 text-sm">Here's what's happening with your business today.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAlerts(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/30"
                  >
                    <FiBell />
                    <span className="hidden sm:inline">Alerts</span>
                  </button>
                  <button
                    onClick={() => setShowInsights(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all border border-blue-500/30"
                  >
                    <FiBarChart2 />
                    <span className="hidden sm:inline">Insights</span>
                  </button>
                  <button
                    onClick={() => setShowCashflow(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/30"
                  >
                    <FiZap />
                    <span className="hidden sm:inline">Cashflow</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar filters={filters} setFilters={setFilters} />

            {/* Quick Actions */}
            <QuickActions onAction={(type) => setActiveQuickAction(type)} />

            {/* Warnings */}
            <WarningsCard
              inventory={dashboardInventory}
              salesItems={salesItems}
              onAction={(type) => setActiveQuickAction(type)}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Today's Revenue"
                value={`KES ${summary.today.revenue.toLocaleString()}`}
                icon={<FiDollarSign />}
                color="green"
                trend={`+${summary.growth.revenue}%`}
              />
              <StatsCard
                title="Today's Transactions"
                value={summary.today.transactions}
                icon={<FiShoppingCart />}
                color="blue"
                trend={`+${summary.growth.transactions}%`}
              />
              <StatsCard
                title="Net Profit"
                value={`KES ${netProfit.toLocaleString()}`}
                icon={<FiTrendingUp />}
                color="purple"
                subtitle={`${profitMargin}% margin`}
              />
              <StatsCard
                title="Avg Transaction"
                value={`KES ${Math.round(summary.today.avgTransaction).toLocaleString()}`}
                icon={<FiPercent />}
                color="orange"
              />
            </div>

            {/* All-time Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <StatsCard
                title="Total Revenue"
                value={`KES ${summary.total.revenue.toLocaleString()}`}
                icon={<FiTrendingUp />}
                color="green"
                subtitle="All time"
              />
              <StatsCard
                title="Total Transactions"
                value={summary.total.transactions}
                icon={<FiActivity />}
                color="blue"
                subtitle="All time"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <RevenueChart />
              <TransactionChart />
            </div>

            {/* Sales Breakdown */}
            <div className="mb-6">
              <SalesBreakdown sales={salesItems} />
            </div>

            {/* AI Market Advisor */}
            <div className="mb-6">
              <AIMarketAdvisor />
            </div>

            {/* Activity Feed + AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed
                  transactions={summary.recent_transactions}
                  onAddTransaction={() => setShowTransactionModal(true)}
                />
              </div>
              <div className="lg:col-span-1">
                <AIAssistant />
              </div>
            </div>
          </>
        )}
      </div>

      {showTransactionModal && (
        <TransactionModal
          onClose={() => setShowTransactionModal(false)}
          onSuccess={handleTransactionCreated}
        />
      )}

      {activeQuickAction && (
        <QuickActionModal
          type={activeQuickAction}
          onClose={() => setActiveQuickAction(null)}
          onSuccess={handleQuickActionSuccess}
        />
      )}

      {showDailySummary && yesterdaySummary && (
        <DailySummaryModal
          summary={yesterdaySummary}
          onClose={() => setShowDailySummary(false)}
        />
      )}

      {/* Alerts Center */}
      {showAlerts && <AlertsCenter onClose={() => setShowAlerts(false)} />}

      {/* Weekly Insights */}
      {showInsights && <WeeklyInsights onClose={() => setShowInsights(false)} />}

      {/* Cashflow Predictions */}
      {showCashflow && <CashflowPredictions onClose={() => setShowCashflow(false)} />}

      <PWAInstallPrompt />
    </div>
  );
};

export default Dashboard;
