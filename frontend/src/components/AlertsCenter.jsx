import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle,
  FiX, FiTrendingDown, FiPackage, FiDollarSign, FiClock,
  FiShoppingCart, FiActivity, FiBell, FiFilter
} from 'react-icons/fi';
import { SalesStorage, InventoryStorage, ExpensesStorage } from '../utils/storage';

const AlertsCenter = ({ onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, critical, warning, info

  useEffect(() => {
    generateAlerts();
  }, []);

  const generateAlerts = () => {
    const generatedAlerts = [];
    const sales = SalesStorage.load();
    const inventory = InventoryStorage.load();
    const expenses = ExpensesStorage.load();

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = sales.filter(s => {
      const saleDate = new Date(s.created_at);
      return saleDate >= today;
    });

    const todayExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.created_at);
      return expenseDate >= today;
    });

    const totalSalesToday = todaySales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);
    const profitToday = totalSalesToday - totalExpensesToday;

    // 1. Critical: Low Stock Alerts
    const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock);
    if (lowStockItems.length > 0) {
      lowStockItems.forEach(item => {
        generatedAlerts.push({
          id: `low-stock-${item.id}`,
          type: 'critical',
          icon: <FiPackage />,
          title: 'Critical Stock Level',
          message: `${item.name} is running low (${item.quantity} ${item.unit} remaining)`,
          action: 'Restock Now',
          timestamp: new Date().toISOString(),
          category: 'inventory'
        });
      });
    }

    // 2. Critical: Out of Stock
    const outOfStock = inventory.filter(item => item.quantity === 0);
    if (outOfStock.length > 0) {
      outOfStock.forEach(item => {
        generatedAlerts.push({
          id: `out-stock-${item.id}`,
          type: 'critical',
          icon: <FiAlertTriangle />,
          title: 'Out of Stock',
          message: `${item.name} is completely out of stock`,
          action: 'Order Immediately',
          timestamp: new Date().toISOString(),
          category: 'inventory'
        });
      });
    }

    // 3. Warning: Low Profit Margin
    if (totalSalesToday > 0) {
      const margin = ((profitToday / totalSalesToday) * 100);
      if (margin < 20 && margin > 0) {
        generatedAlerts.push({
          id: 'low-margin',
          type: 'warning',
          icon: <FiTrendingDown />,
          title: 'Low Profit Margin',
          message: `Today's profit margin is ${margin.toFixed(1)}% (below 20% threshold)`,
          action: 'Review Pricing',
          timestamp: new Date().toISOString(),
          category: 'financial'
        });
      }
    }

    // 4. Critical: Negative Profit
    if (profitToday < 0) {
      generatedAlerts.push({
        id: 'negative-profit',
        type: 'critical',
        icon: <FiDollarSign />,
        title: 'Operating at Loss',
        message: `Today's expenses (KES ${totalExpensesToday.toLocaleString()}) exceed sales (KES ${totalSalesToday.toLocaleString()})`,
        action: 'Take Action',
        timestamp: new Date().toISOString(),
        category: 'financial'
      });
    }

    // 5. Warning: High Expenses
    if (totalExpensesToday > totalSalesToday * 0.7 && totalSalesToday > 0) {
      generatedAlerts.push({
        id: 'high-expenses',
        type: 'warning',
        icon: <FiAlertCircle />,
        title: 'High Expense Ratio',
        message: `Expenses are 70%+ of sales today`,
        action: 'Review Costs',
        timestamp: new Date().toISOString(),
        category: 'financial'
      });
    }

    // 6. Info: Low Sales Activity
    if (todaySales.length < 5 && new Date().getHours() > 12) {
      generatedAlerts.push({
        id: 'low-activity',
        type: 'info',
        icon: <FiActivity />,
        title: 'Low Sales Activity',
        message: `Only ${todaySales.length} sales recorded today`,
        action: 'View Details',
        timestamp: new Date().toISOString(),
        category: 'sales'
      });
    }

    // 7. Info: Inventory Expiring Soon (items not restocked in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldStock = inventory.filter(item => {
      if (!item.last_restocked) return false;
      const restockDate = new Date(item.last_restocked);
      return restockDate < thirtyDaysAgo;
    });

    if (oldStock.length > 0) {
      generatedAlerts.push({
        id: 'old-stock',
        type: 'warning',
        icon: <FiClock />,
        title: 'Aging Inventory',
        message: `${oldStock.length} items haven't been restocked in 30+ days`,
        action: 'Review Stock',
        timestamp: new Date().toISOString(),
        category: 'inventory'
      });
    }

    // 8. Success: Good Performance
    if (profitToday > 0 && totalSalesToday > 10000) {
      const margin = ((profitToday / totalSalesToday) * 100);
      if (margin > 40) {
        generatedAlerts.push({
          id: 'good-performance',
          type: 'success',
          icon: <FiCheckCircle />,
          title: 'Excellent Performance',
          message: `Strong profit margin of ${margin.toFixed(1)}% today!`,
          action: 'View Report',
          timestamp: new Date().toISOString(),
          category: 'financial'
        });
      }
    }

    // 9. Info: Pending Orders (if any)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
    if (pendingOrders.length > 5) {
      generatedAlerts.push({
        id: 'pending-orders',
        type: 'info',
        icon: <FiShoppingCart />,
        title: 'Pending Orders',
        message: `${pendingOrders.length} orders awaiting processing`,
        action: 'Process Orders',
        timestamp: new Date().toISOString(),
        category: 'orders'
      });
    }

    // Sort by priority: critical > warning > info > success
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    generatedAlerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    setAlerts(generatedAlerts);
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <FiBell className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Alerts Center</h2>
                <p className="text-gray-400 text-sm">Real-time business notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All', count: alertCounts.all },
              { id: 'critical', label: 'Critical', count: alertCounts.critical },
              { id: 'warning', label: 'Warning', count: alertCounts.warning },
              { id: 'info', label: 'Info', count: alertCounts.info },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === tab.id ? 'bg-white/20' : 'bg-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400">No {filter !== 'all' ? filter : ''} alerts at the moment</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${getAlertStyle(alert.type)} hover:bg-opacity-20 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${alert.type === 'critical' ? 'bg-red-500/20' : alert.type === 'warning' ? 'bg-yellow-500/20' : alert.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                    <span className={`text-2xl ${getAlertIcon(alert.type)}`}>
                      {alert.icon}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-white">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getAlertStyle(alert.type)}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <button className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        alert.type === 'critical' 
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : alert.type === 'warning'
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                          : alert.type === 'success'
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                      }`}>
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Last updated: {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <button
              onClick={generateAlerts}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <FiActivity size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsCenter;
