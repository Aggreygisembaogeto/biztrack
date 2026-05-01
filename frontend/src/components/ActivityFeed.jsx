import React, { useState } from 'react';
import { FiPlus, FiCheckCircle, FiClock, FiXCircle, FiSearch } from 'react-icons/fi';

const ActivityFeed = ({ transactions, onAddTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(txn => {
    const searchLower = searchTerm.toLowerCase();
    return (
      txn.description?.toLowerCase().includes(searchLower) ||
      txn.customer_phone?.includes(searchTerm) ||
      txn.amount?.toString().includes(searchTerm) ||
      txn.type?.toLowerCase().includes(searchLower) ||
      txn.item_name?.toLowerCase().includes(searchLower)
    );
  });
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      case 'failed':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Live Activity Feed</h2>
          <p className="text-sm text-gray-400 mt-1">Recent transactions and updates</p>
        </div>
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg"
        >
          <FiPlus />
          Add Transaction
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 pt-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'No transactions match your search' : 'No transactions yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddTransaction}
                className="text-primary-500 hover:text-primary-400"
              >
                Create your first transaction
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="text-2xl">
                  {getStatusIcon(transaction.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      {transaction.type === 'order' ? 'Order' : 'Payment'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {transaction.description || 'No description'}
                  </p>
                  {transaction.customer_phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.customer_phone}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    KES {parseFloat(transaction.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
