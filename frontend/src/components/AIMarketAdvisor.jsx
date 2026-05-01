import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertCircle, FiCheckCircle, FiZap, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';

const AIMarketAdvisor = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time market insights
  const marketInsights = [
    {
      id: 1,
      type: 'opportunity',
      icon: <FiTrendingUp className="text-green-500" />,
      title: 'Peak Demand Alert',
      message: 'Lunch orders are 25% higher than usual. Consider increasing lunch menu availability.',
      priority: 'high',
      timestamp: '2 mins ago'
    },
    {
      id: 2,
      type: 'warning',
      icon: <FiAlertCircle className="text-yellow-500" />,
      title: 'Inventory Alert',
      message: 'Cooking oil stock is running low. Restock recommended within 2 days.',
      priority: 'medium',
      timestamp: '15 mins ago'
    },
    {
      id: 3,
      type: 'success',
      icon: <FiCheckCircle className="text-blue-500" />,
      title: 'Market Trend',
      message: 'Weekend sales increased by 18%. Your promotional strategy is working well.',
      priority: 'low',
      timestamp: '1 hour ago'
    },
    {
      id: 4,
      type: 'insight',
      icon: <FiZap className="text-purple-500" />,
      title: 'Customer Behavior',
      message: 'Evening orders peak at 7 PM. Consider staffing adjustments for better service.',
      priority: 'medium',
      timestamp: '2 hours ago'
    },
    {
      id: 5,
      type: 'opportunity',
      icon: <FiBarChart2 className="text-orange-500" />,
      title: 'Revenue Opportunity',
      message: 'Catering services show 35% profit margin. Expand this segment for growth.',
      priority: 'high',
      timestamp: '3 hours ago'
    }
  ];

  useEffect(() => {
    // Load initial insights
    setInsights(marketInsights.slice(0, 3));

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
      setInsights(prev => {
        const newInsights = [{ ...randomInsight, timestamp: 'Just now' }, ...prev];
        return newInsights.slice(0, 5); // Keep only 5 most recent
      });
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshInsights = () => {
    setLoading(true);
    setTimeout(() => {
      setInsights(marketInsights.slice(0, 5));
      setLastUpdate(new Date());
      setLoading(false);
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
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={refreshInsights}
          disabled={loading}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`text-orange-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Real-time Market Trends */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <FiTrendingUp className="text-orange-500 text-xl flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-orange-500 font-bold text-sm mb-1">Live Market Status</h4>
            <p className="text-gray-300 text-xs">
              Nairobi restaurant sector showing 12% growth this week. Food delivery demand up 23%.
            </p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {insights.map((insight) => (
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
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-white font-medium text-sm mb-3">Recommended Actions</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
            View detailed analytics
          </button>
          <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
            Check inventory levels
          </button>
          <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
            Review pricing strategy
          </button>
        </div>
      </div>

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Powered by AI - Real-time insights</span>
        </div>
      </div>
    </div>
  );
};

export default AIMarketAdvisor;
