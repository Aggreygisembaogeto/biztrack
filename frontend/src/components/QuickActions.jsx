import React from 'react';
import { FiShoppingCart, FiTrendingDown, FiPackage, FiCreditCard } from 'react-icons/fi';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      key: 'sale',
      label: 'Add Sale',
      icon: <FiShoppingCart size={20} />,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Record a new sale'
    },
    {
      key: 'expense',
      label: 'Add Expense',
      icon: <FiTrendingDown size={20} />,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Log a business expense'
    },
    {
      key: 'stock',
      label: 'Add Stock',
      icon: <FiPackage size={20} />,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Update inventory stock'
    },
    {
      key: 'payment',
      label: 'Record Payment',
      icon: <FiCreditCard size={20} />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      description: 'Record a customer payment'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3 text-gray-400">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => onAction(action.key)}
            className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0`}
          >
            {action.icon}
            <span className="font-semibold text-sm">{action.label}</span>
            <span className="text-xs opacity-80 hidden sm:block">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
