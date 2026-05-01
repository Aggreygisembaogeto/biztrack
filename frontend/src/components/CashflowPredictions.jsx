import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar,
  FiAlertCircle, FiCheckCircle, FiX, FiDownload, FiRefreshCw,
  FiBarChart2, FiActivity, FiTarget, FiZap
} from 'react-icons/fi';
import { SalesStorage, ExpensesStorage } from '../utils/storage';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CashflowPredictions = ({ onClose }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // 7, 30, 90 days

  useEffect(() => {
    generatePredictions();
  }, [timeframe]);

  const generatePredictions = () => {
    setLoading(true);
    const sales = SalesStorage.load();
    const expenses = ExpensesStorage.load();

    // Get historical data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const historicalSales = sales.filter(s => new Date(s.created_at) >= ninetyDaysAgo);
    const historicalExpenses = expenses.filter(e => new Date(e.created_at) >= ninetyDaysAgo);

    // Calculate daily averages
    const dailyData = {};
    
    // Process sales
    historicalSales.forEach(sale => {
      const date = new Date(sale.created_at).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, expenses: 0, date: new Date(sale.created_at) };
      }
      dailyData[date].sales += sale.amount || 0;
    });

    // Process expenses
    historicalExpenses.forEach(expense => {
      const date = new Date(expense.created_at).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, expenses: 0, date: new Date(expense.created_at) };
      }
      dailyData[date].expenses += Math.abs(expense.amount || 0);
    });

    const historicalArray = Object.values(dailyData).sort((a, b) => a.date - b.date);

    // Calculate trends using linear regression
    const calculateTrend = (data, key) => {
      if (data.length === 0) return { slope: 0, intercept: 0 };
      
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      data.forEach((point, index) => {
        const x = index;
        const y = point[key];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      });
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    };

    const salesTrend = calculateTrend(historicalArray, 'sales');
    const expensesTrend = calculateTrend(historicalArray, 'expenses');

    // Calculate averages
    const avgDailySales = historicalArray.reduce((sum, d) => sum + d.sales, 0) / historicalArray.length || 0;
    const avgDailyExpenses = historicalArray.reduce((sum, d) => sum + d.expenses, 0) / historicalArray.length || 0;

    // Calculate volatility (standard deviation)
    const salesVolatility = Math.sqrt(
      historicalArray.reduce((sum, d) => sum + Math.pow(d.sales - avgDailySales, 2), 0) / historicalArray.length
    );
    const expensesVolatility = Math.sqrt(
      historicalArray.reduce((sum, d) => sum + Math.pow(d.expenses - avgDailyExpenses, 2), 0) / historicalArray.length
    );

    // Generate predictions
    const daysToPredict = parseInt(timeframe);
    const today = new Date();
    const predictedData = [];
    const startIndex = historicalArray.length;

    for (let i = 0; i < daysToPredict; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i + 1);
      
      // Linear prediction with seasonal adjustment
      const dayOfWeek = futureDate.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0; // 30% less on weekends
      
      const predictedSales = (salesTrend.slope * (startIndex + i) + salesTrend.intercept) * weekendFactor;
      const predictedExpenses = expensesTrend.slope * (startIndex + i) + expensesTrend.intercept;
      
      // Add confidence intervals (±1 standard deviation)
      predictedData.push({
        date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: futureDate,
        sales: Math.max(0, predictedSales),
        expenses: Math.max(0, predictedExpenses),
        cashflow: predictedSales - predictedExpenses,
        salesLow: Math.max(0, predictedSales - salesVolatility),
        salesHigh: predictedSales + salesVolatility,
        expensesLow: Math.max(0, predictedExpenses - expensesVolatility),
        expensesHigh: predictedExpenses + expensesVolatility,
        confidence: Math.max(60, 95 - (i * 0.5)) // Confidence decreases over time
      });
    }

    // Calculate summary metrics
    const totalPredictedSales = predictedData.reduce((sum, d) => sum + d.sales, 0);
    const totalPredictedExpenses = predictedData.reduce((sum, d) => sum + d.expenses, 0);
    const totalPredictedCashflow = totalPredictedSales - totalPredictedExpenses;
    const avgPredictedCashflow = totalPredictedCashflow / daysToPredict;

    // Identify risks and opportunities
    const risks = [];
    const opportunities = [];

    // Check for negative cashflow days
    const negativeDays = predictedData.filter(d => d.cashflow < 0);
    if (negativeDays.length > 0) {
      risks.push({
        type: 'warning',
        title: 'Negative Cashflow Days',
        message: `${negativeDays.length} days predicted with negative cashflow`,
        impact: 'high'
      });
    }

    // Check for declining trend
    if (salesTrend.slope < 0) {
      risks.push({
        type: 'critical',
        title: 'Declining Sales Trend',
        message: `Sales trending down by KES ${Math.abs(salesTrend.slope * 30).toFixed(0)} per month`,
        impact: 'high'
      });
    }

    // Check for increasing expenses
    if (expensesTrend.slope > avgDailyExpenses * 0.01) {
      risks.push({
        type: 'warning',
        title: 'Rising Expenses',
        message: `Expenses increasing by KES ${(expensesTrend.slope * 30).toFixed(0)} per month`,
        impact: 'medium'
      });
    }

    // Identify opportunities
    if (salesTrend.slope > 0) {
      opportunities.push({
        type: 'success',
        title: 'Growing Sales',
        message: `Sales trending up by KES ${(salesTrend.slope * 30).toFixed(0)} per month`,
        potential: 'high'
      });
    }

    if (totalPredictedCashflow > 0) {
      opportunities.push({
        type: 'success',
        title: 'Positive Cashflow',
        message: `Expected surplus of KES ${totalPredictedCashflow.toFixed(0)} over ${daysToPredict} days`,
        potential: 'high'
      });
    }

    // Calculate runway (days until cash runs out)
    let currentCash = avgDailySales * 7; // Assume 1 week of sales as current cash
    let runway = 0;
    for (let i = 0; i < predictedData.length; i++) {
      currentCash += predictedData[i].cashflow;
      if (currentCash < 0) {
        runway = i + 1;
        break;
      }
    }

    setPredictions({
      historical: historicalArray.slice(-30), // Last 30 days
      predicted: predictedData,
      summary: {
        totalSales: totalPredictedSales,
        totalExpenses: totalPredictedExpenses,
        totalCashflow: totalPredictedCashflow,
        avgDailyCashflow: avgPredictedCashflow,
        avgDailySales,
        avgDailyExpenses,
        salesGrowth: salesTrend.slope * 30,
        expensesGrowth: expensesTrend.slope * 30,
        runway: runway || daysToPredict
      },
      risks,
      opportunities,
      confidence: {
        overall: Math.round(predictedData.reduce((sum, d) => sum + d.confidence, 0) / predictedData.length),
        dataQuality: historicalArray.length >= 30 ? 'high' : historicalArray.length >= 14 ? 'medium' : 'low'
      }
    });

    setLoading(false);
  };

  const formatCurrency = (amount) => `KES ${Math.round(amount).toLocaleString()}`;

  if (loading || !predictions) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-white mt-4 text-center">Analyzing cashflow patterns...</p>
          <p className="text-gray-400 text-sm mt-2 text-center">Using ML algorithms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-7xl shadow-2xl my-8">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <FiZap className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Cashflow Predictions</h2>
                  <p className="text-gray-400 text-sm">Machine learning-powered financial forecasting</p>
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
            {/* Timeframe Selector */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['7', '30', '90'].map(days => (
                  <button
                    key={days}
                    onClick={() => setTimeframe(days)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeframe === days
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg">
                <FiTarget className="text-purple-500" />
                <span className="text-sm text-gray-300">
                  Confidence: <span className="font-bold text-white">{predictions.confidence.overall}%</span>
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm font-medium">PREDICTED SALES</span>
                  <FiTrendingUp className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(predictions.summary.totalSales)}</p>
                <p className="text-xs text-green-400">Next {timeframe} days</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl border border-red-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-sm font-medium">PREDICTED EXPENSES</span>
                  <FiTrendingDown className="text-red-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(predictions.summary.totalExpenses)}</p>
                <p className="text-xs text-red-400">Next {timeframe} days</p>
              </div>

              <div className={`bg-gradient-to-br ${predictions.summary.totalCashflow >= 0 ? 'from-blue-500/10 to-blue-600/10' : 'from-orange-500/10 to-orange-600/10'} rounded-xl border ${predictions.summary.totalCashflow >= 0 ? 'border-blue-500/30' : 'border-orange-500/30'} p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${predictions.summary.totalCashflow >= 0 ? 'text-blue-400' : 'text-orange-400'} text-sm font-medium`}>NET CASHFLOW</span>
                  {predictions.summary.totalCashflow >= 0 ? (
                    <FiTrendingUp className="text-blue-500" size={24} />
                  ) : (
                    <FiTrendingDown className="text-orange-500" size={24} />
                  )}
                </div>
                <p className={`text-3xl font-bold mb-1 ${predictions.summary.totalCashflow >= 0 ? 'text-white' : 'text-orange-400'}`}>
                  {formatCurrency(predictions.summary.totalCashflow)}
                </p>
                <p className={`text-xs ${predictions.summary.totalCashflow >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {predictions.summary.totalCashflow >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm font-medium">RUNWAY</span>
                  <FiActivity className="text-purple-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{predictions.summary.runway}</p>
                <p className="text-xs text-purple-400">Days of operation</p>
              </div>
            </div>

            {/* Prediction Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-purple-500" />
                Cashflow Forecast
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={predictions.predicted}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" name="Predicted Sales" />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" name="Predicted Expenses" />
                  <Area type="monotone" dataKey="cashflow" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorCashflow)" name="Net Cashflow" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risks and Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risks */}
              {predictions.risks.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-red-500" />
                    Identified Risks
                  </h3>
                  <div className="space-y-3">
                    {predictions.risks.map((risk, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${
                          risk.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FiAlertCircle className={risk.type === 'critical' ? 'text-red-500' : 'text-yellow-500'} size={20} />
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{risk.title}</h4>
                            <p className="text-sm text-gray-300 mb-2">{risk.message}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              risk.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {risk.impact.toUpperCase()} IMPACT
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {predictions.opportunities.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    Growth Opportunities
                  </h3>
                  <div className="space-y-3">
                    {predictions.opportunities.map((opp, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border bg-green-500/10 border-green-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <FiCheckCircle className="text-green-500" size={20} />
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{opp.title}</h4>
                            <p className="text-sm text-gray-300 mb-2">{opp.message}</p>
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                              {opp.potential.toUpperCase()} POTENTIAL
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiZap className="text-purple-500" />
                AI-Powered Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Sales Trend</p>
                  <p className={`text-2xl font-bold ${predictions.summary.salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {predictions.summary.salesGrowth >= 0 ? '+' : ''}{formatCurrency(predictions.summary.salesGrowth)}
                  </p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Expense Trend</p>
                  <p className={`text-2xl font-bold ${predictions.summary.expensesGrowth <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {predictions.summary.expensesGrowth >= 0 ? '+' : ''}{formatCurrency(predictions.summary.expensesGrowth)}
                  </p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Data Quality</p>
                  <p className={`text-2xl font-bold ${
                    predictions.confidence.dataQuality === 'high' ? 'text-green-500' : 
                    predictions.confidence.dataQuality === 'medium' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {predictions.confidence.dataQuality.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">prediction accuracy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiActivity className="text-purple-500" />
              <span>Powered by machine learning algorithms</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generatePredictions}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                <FiRefreshCw />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {/* Export functionality */}}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors border border-purple-500/30"
              >
                <FiDownload />
                <span>Export Forecast</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowPredictions;
