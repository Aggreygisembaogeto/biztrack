import React from 'react';
import { FiX, FiTrendingUp, FiDollarSign, FiShoppingCart, FiPackage } from 'react-icons/fi';

const DailySummaryModal = ({ summary, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl animate-slideUp">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-orange-600/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Yesterday's Summary</h2>
            <p className="text-gray-400 text-sm mt-1">Here's how your business performed</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <FiX size={22} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FiDollarSign className="text-green-500 text-2xl" />
              </div>
              <span className="text-gray-300 font-medium">Total Sales</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              KES {summary.totalSales.toLocaleString()}
            </p>
            <p className="text-green-300 text-sm mt-1">
              {summary.transactionCount} transactions
            </p>
          </div>
          
          {/* Top Item */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FiShoppingCart className="text-blue-500 text-2xl" />
              </div>
              <span className="text-gray-300 font-medium">Top Selling Item</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.topItem}</p>
            <p className="text-blue-300 text-sm mt-1">
              {summary.topItemQuantity} units sold
            </p>
          </div>
          
          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FiTrendingUp className="text-red-500 text-2xl" />
              </div>
              <span className="text-gray-300 font-medium">Total Expenses</span>
            </div>
            <p className="text-3xl font-bold text-red-400">
              KES {summary.totalExpenses.toLocaleString()}
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FiPackage className="text-purple-500 text-2xl" />
              </div>
              <span className="text-gray-300 font-medium">Net Profit</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              KES {(summary.totalSales - summary.totalExpenses).toLocaleString()}
            </p>
            <p className="text-purple-300 text-sm mt-1">
              {summary.totalSales > 0 
                ? `${(((summary.totalSales - summary.totalExpenses) / summary.totalSales) * 100).toFixed(1)}% margin`
                : '0% margin'
              }
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg mt-4"
          >
            Got it! Let's get to work 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryModal;
