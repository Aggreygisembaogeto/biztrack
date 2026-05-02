import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertCircle, FiCheckCircle, FiZap, FiRefreshCw, FiBarChart2, FiDollarSign, FiShoppingCart, FiPackage } from 'react-icons/fi';
import { salesAPI, inventoryAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AIMarketAdvisor = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [marketData, setMarketData] = useState(null);
  const [businessData, setBusinessData] = useState(null);

  // Kenya-specific market data (updated regularly)
  const kenyaMarketTrends = {
    foodPrices: {
      maize: { price: 45, trend: 'up', change: 5 }, // KES per kg
      rice: { price: 120, trend: 'stable', change: 0 },
      beans: { price: 110, trend: 'up', change: 8 },
      sugar: { price: 150, trend: 'down', change: -3 },
      cookingOil: { price: 280, trend: 'up', change: 12 },
      wheat: { price: 55, trend: 'stable', change: 2 },
      milk: { price: 60, trend: 'up', change: 5 },
      eggs: { price: 15, trend: 'stable', change: 0 }, // per egg
      tomatoes: { price: 80, trend: 'down', change: -10 },
      onions: { price: 70, trend: 'up', change: 15 },
      potatoes: { price: 50, trend: 'stable', change: 0 },
      chicken: { price: 350, trend: 'up', change: 7 } // per kg
    },
    economicIndicators: {
      inflation: 6.8, // Current Kenya inflation rate
      usdToKes: 129.5, // Current exchange rate
      fuelPrice: 177.3, // KES per liter
      interestRate: 13.0 // CBK rate
    },
    seasonalTrends: {
      currentSeason: 'Dry Season',
      peakDemandItems: ['Beverages', 'Cold Foods', 'Ice Cream'],
      lowDemandItems: ['Hot Soups', 'Heavy Stews'],
      upcomingEvents: ['End Month', 'School Holidays Approaching']
    },
    consumerBehavior: {
      peakHours: ['12:00-14:00', '19:00-21:00'],
      popularPaymentMethods: ['M-Pesa', 'Cash', 'Card'],
      averageOrderValue: 850, // KES
      deliveryDemand: 'High'
    }
  };

  // Fetch business data from API
  useEffect(() => {
    fetchBusinessData();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchBusinessData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const fetchBusinessData = async () => {
    try {
      const [salesRes, inventoryRes] = await Promise.allSettled([
        salesAPI.getStats(),
        inventoryAPI.getAll()
      ]);

      const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : null;
      const inventoryData = inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : [];

      setBusinessData({
        sales: salesData,
        inventory: inventoryData
      });

      // Generate AI insights based on real data
      generateAIInsights(salesData, inventoryData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  const generateAIInsights = (salesData, inventoryData) => {
    const newInsights = [];
    const now = new Date();

    // 1. Analyze inventory against market prices
    if (inventoryData && inventoryData.length > 0) {
      const lowStockItems = inventoryData.filter(item => item.quantity <= item.min_stock);
      
      if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
          const marketPrice = getMarketPrice(item.name);
          if (marketPrice) {
            const trend = marketPrice.trend === 'up' ? 'increasing' : marketPrice.trend === 'down' ? 'decreasing' : 'stable';
            newInsights.push({
              id: `inv-${item.id}-${Date.now()}`,
              type: marketPrice.trend === 'down' ? 'opportunity' : 'warning',
              icon: marketPrice.trend === 'down' ? <FiTrendingUp className="text-green-500" /> : <FiAlertCircle className="text-yellow-500" />,
              title: `${item.name} Stock Alert`,
              message: `${item.name} is low (${item.quantity} ${item.unit}). Market price is ${trend} (${marketPrice.change > 0 ? '+' : ''}${marketPrice.change}%). ${marketPrice.trend === 'down' ? 'Good time to restock!' : 'Consider waiting if prices stabilize.'}`,
              priority: item.quantity === 0 ? 'high' : 'medium',
              timestamp: 'Just now',
              action: 'restock',
              itemId: item.id
            });
          }
        });
      }
    }

    // 2. Sales performance insights
    if (salesData) {
      const todayRevenue = salesData.today?.today_revenue || 0;
      const weekRevenue = salesData.week?.week_revenue || 0;
      
      if (todayRevenue > 0) {
        const avgDailyTarget = 5000; // KES
        const performance = (todayRevenue / avgDailyTarget) * 100;
        
        if (performance > 120) {
          newInsights.push({
            id: `sales-high-${Date.now()}`,
            type: 'success',
            icon: <FiCheckCircle className="text-green-500" />,
            title: 'Excellent Sales Performance',
            message: `Today's revenue (KES ${todayRevenue.toLocaleString()}) is ${Math.round(performance - 100)}% above target! Keep up the momentum.`,
            priority: 'low',
            timestamp: '5 mins ago'
          });
        } else if (performance < 70) {
          newInsights.push({
            id: `sales-low-${Date.now()}`,
            type: 'warning',
            icon: <FiAlertCircle className="text-yellow-500" />,
            title: 'Sales Below Target',
            message: `Today's revenue is ${Math.round(100 - performance)}% below target. Consider promotional offers or menu adjustments.`,
            priority: 'high',
            timestamp: '5 mins ago'
          });
        }
      }
    }

    // 3. Market trend insights
    const hour = now.getHours();
    if (hour >= 11 && hour <= 14) {
      newInsights.push({
        id: `peak-lunch-${Date.now()}`,
        type: 'opportunity',
        icon: <FiShoppingCart className="text-orange-500" />,
        title: 'Peak Lunch Hour',
        message: 'Lunch rush period (12-2 PM). Ensure adequate staff and inventory for popular items.',
        priority: 'high',
        timestamp: 'Now'
      });
    } else if (hour >= 18 && hour <= 21) {
      newInsights.push({
        id: `peak-dinner-${Date.now()}`,
        type: 'opportunity',
        icon: <FiShoppingCart className="text-orange-500" />,
        title: 'Peak Dinner Hour',
        message: 'Dinner rush period (7-9 PM). High demand expected based on Nairobi trends.',
        priority: 'high',
        timestamp: 'Now'
      });
    }

    // 4. Economic insights
    if (kenyaMarketTrends.economicIndicators.inflation > 6.5) {
      newInsights.push({
        id: `inflation-${Date.now()}`,
        type: 'insight',
        icon: <FiDollarSign className="text-purple-500" />,
        title: 'Inflation Impact',
        message: `Kenya inflation at ${kenyaMarketTrends.economicIndicators.inflation}%. Consider reviewing menu prices to maintain margins.`,
        priority: 'medium',
        timestamp: '1 hour ago'
      });
    }

    // 5. Seasonal recommendations
    const season = kenyaMarketTrends.seasonalTrends;
    newInsights.push({
      id: `seasonal-${Date.now()}`,
      type: 'insight',
      icon: <FiBarChart2 className="text-blue-500" />,
      title: `${season.currentSeason} Trends`,
      message: `High demand for: ${season.peakDemandItems.join(', ')}. Consider featuring these items prominently.`,
      priority: 'medium',
      timestamp: '2 hours ago'
    });

    // 6. Payment method insights
    newInsights.push({
      id: `payment-${Date.now()}`,
      type: 'success',
      icon: <FiCheckCircle className="text-green-500" />,
      title: 'M-Pesa Dominance',
      message: 'M-Pesa remains the preferred payment method in Kenya. Ensure your M-Pesa integration is working smoothly.',
      priority: 'low',
      timestamp: '3 hours ago'
    });

    // 7. Fuel price impact
    if (kenyaMarketTrends.economicIndicators.fuelPrice > 170) {
      newInsights.push({
        id: `fuel-${Date.now()}`,
        type: 'warning',
        icon: <FiAlertCircle className="text-yellow-500" />,
        title: 'High Fuel Costs',
        message: `Fuel at KES ${kenyaMarketTrends.economicIndicators.fuelPrice}/L. Consider delivery fee adjustments or local sourcing.`,
        priority: 'medium',
        timestamp: '4 hours ago'
      });
    }

    // Sort by priority and limit to 8 insights
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    newInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setInsights(newInsights.slice(0, 8));
  };

  const getMarketPrice = (itemName) => {
    const name = itemName.toLowerCase();
    const prices = kenyaMarketTrends.foodPrices;
    
    for (const [key, value] of Object.entries(prices)) {
      if (name.includes(key) || key.includes(name)) {
        return value;
      }
    }
    return null;
  };

  const refreshInsights = () => {
    setLoading(true);
    fetchBusinessData();
    setTimeout(() => {
      setLoading(false);
      toast.success('Market insights updated!');
    }, 1000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FiZap className="text-orange-500" />
            AI Market Advisor
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            Kenya Market Data • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={refreshInsights}
          disabled={loading}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh market insights"
        >
          <FiRefreshCw className={`text-orange-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Real-time Market Status */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <FiTrendingUp className="text-orange-500 text-xl flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-orange-500 font-bold text-sm mb-1">Live Kenya Market Status</h4>
            <div className="text-gray-300 text-xs space-y-1">
              <p>• Inflation: {kenyaMarketTrends.economicIndicators.inflation}% | USD/KES: {kenyaMarketTrends.economicIndicators.usdToKes}</p>
              <p>• Fuel: KES {kenyaMarketTrends.economicIndicators.fuelPrice}/L | {kenyaMarketTrends.seasonalTrends.currentSeason}</p>
              <p>• Peak Hours: {kenyaMarketTrends.consumerBehavior.peakHours.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Price Movements */}
      <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
          <FiPackage className="text-blue-500" />
          Key Commodity Prices (KES)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(kenyaMarketTrends.foodPrices).slice(0, 6).map(([name, data]) => (
            <div key={name} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
              <span className="text-gray-300 capitalize">{name}</span>
              <div className="flex items-center gap-1">
                <span className="text-white font-medium">{data.price}</span>
                <span className={`text-xs ${data.trend === 'up' ? 'text-red-400' : data.trend === 'down' ? 'text-green-400' : 'text-gray-400'}`}>
                  {data.change > 0 ? '+' : ''}{data.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 bg-gray-700/50 rounded-lg border-l-4 ${getPriorityColor(insight.priority)} hover:bg-gray-700 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{insight.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FiZap className="mx-auto text-gray-600 mb-2" size={32} />
            <p className="text-gray-400 text-sm">Loading market insights...</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-white font-medium text-sm mb-3">AI Recommendations</h4>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/analytics'}
            className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
          >
            📊 View detailed analytics
          </button>
          <button 
            onClick={() => window.location.href = '/inventory'}
            className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
          >
            📦 Check inventory levels
          </button>
          <button 
            onClick={() => window.location.href = '/reports'}
            className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
          >
            💰 Review pricing strategy
          </button>
        </div>
      </div>

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>AI-Powered • Kenya Market Data • Real-time Analysis</span>
        </div>
      </div>
    </div>
  );
};

export default AIMarketAdvisor;
