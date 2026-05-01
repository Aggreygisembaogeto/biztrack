import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiTrendingDown,
  FiPackage,
  FiRefreshCw,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiShoppingCart
} from 'react-icons/fi';

const WARNING_TYPES = {
  low_stock: {
    icon: <FiPackage size={16} />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    badge: 'bg-yellow-400/20 text-yellow-400',
    label: 'Low Stock'
  },
  critical_stock: {
    icon: <FiAlertTriangle size={16} />,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    badge: 'bg-red-400/20 text-red-400',
    label: 'Critical'
  },
  sales_drop: {
    icon: <FiTrendingDown size={16} />,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    badge: 'bg-orange-400/20 text-orange-400',
    label: 'Sales Drop'
  }
};

const WarningsCard = ({ inventory, salesItems, onAction }) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(new Set());
  const [collapsed, setCollapsed] = useState(false);

  // --- Build warnings from inventory ---
  const stockWarnings = inventory
    .filter(item => item.quantity <= item.minStock)
    .map(item => {
      const isCritical = item.quantity <= item.minStock * 0.5;
      return {
        id: `stock-${item.id}`,
        type: isCritical ? 'critical_stock' : 'low_stock',
        title: item.name,
        detail: `${item.quantity} ${item.unit} remaining — min is ${item.minStock} ${item.unit}`,
        action: { label: 'Restock', fn: () => onAction('stock') }
      };
    });

  // --- Build sales drop warnings from salesItems ---
  // Group by item, compare last 2 sales to detect a drop
  const salesByItem = {};
  [...salesItems].reverse().forEach(s => {
    if (s.type !== 'sale' || !s.item_name) return;
    const key = s.item_name.toLowerCase();
    if (!salesByItem[key]) salesByItem[key] = { name: s.item_name, entries: [] };
    salesByItem[key].entries.push(s);
  });

  const salesDropWarnings = Object.values(salesByItem)
    .filter(g => g.entries.length >= 2)
    .filter(g => {
      const latest = parseFloat(g.entries[0].amount);
      const previous = parseFloat(g.entries[1].amount);
      return previous > 0 && latest < previous * 0.6; // >40% drop
    })
    .map(g => {
      const latest = parseFloat(g.entries[0].amount);
      const previous = parseFloat(g.entries[1].amount);
      const drop = (((previous - latest) / previous) * 100).toFixed(0);
      return {
        id: `drop-${g.name}`,
        type: 'sales_drop',
        title: `${g.name} sales dropped`,
        detail: `Down ${drop}% — KES ${latest.toLocaleString()} vs KES ${previous.toLocaleString()} previously`,
        action: { label: 'Add Sale', fn: () => onAction('sale') }
      };
    });

  const allWarnings = [...stockWarnings, ...salesDropWarnings].filter(
    w => !dismissed.has(w.id)
  );

  const criticalCount = allWarnings.filter(w => w.type === 'critical_stock').length;
  const totalCount = allWarnings.length;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${criticalCount > 0 ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
            <FiAlertTriangle
              size={18}
              className={criticalCount > 0 ? 'text-red-400' : 'text-yellow-400'}
            />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Business Warnings</h3>
            <p className="text-gray-400 text-xs">
              {totalCount === 0
                ? 'All systems normal'
                : `${totalCount} warning${totalCount > 1 ? 's' : ''} require attention`}
            </p>
          </div>
          {totalCount > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
              criticalCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalCount === 0 && (
            <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-400/10 rounded-lg">
              All Good
            </span>
          )}
          {collapsed
            ? <FiChevronDown className="text-gray-400" size={18} />
            : <FiChevronUp className="text-gray-400" size={18} />
          }
        </div>
      </div>

      {/* Warning items */}
      {!collapsed && (
        <div className="border-t border-gray-700">
          {totalCount === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No warnings at this time. Your business is running smoothly.
            </div>
          ) : (
            <div className="divide-y divide-gray-700/60">
              {allWarnings.map(warning => {
                const cfg = WARNING_TYPES[warning.type];
                return (
                  <div
                    key={warning.id}
                    className={`flex items-start gap-3 px-4 py-3 ${cfg.bg} hover:brightness-110 transition-all`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-lg border ${cfg.border} ${cfg.color}`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{warning.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{warning.detail}</p>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={warning.action.fn}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold rounded-lg transition-all shadow whitespace-nowrap"
                      >
                        {warning.type === 'low_stock' || warning.type === 'critical_stock'
                          ? <FiRefreshCw size={12} />
                          : <FiShoppingCart size={12} />
                        }
                        {warning.action.label}
                      </button>
                      <button
                        onClick={() => setDismissed(prev => new Set([...prev, warning.id]))}
                        className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-xs"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {totalCount > 0 && (
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setDismissed(new Set(allWarnings.map(w => w.id)))}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Dismiss all
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                View Inventory <FiArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WarningsCard;
