import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiTrendingUp, FiShoppingCart } from 'react-icons/fi';

const COLORS = [
  '#f97316', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f59e0b', '#06b6d4', '#84cc16'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0 && payload[0]) {
    const d = payload[0].payload;
    if (!d) return null;
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
        <p className="text-white font-bold mb-1">{d.item || 'Unknown'}</p>
        <p className="text-green-400">Revenue: KES {(d.revenue || 0).toLocaleString()}</p>
        <p className="text-gray-400">Units sold: {d.qty || 0}</p>
        <p className="text-gray-400">Transactions: {d.count || 0}</p>
      </div>
    );
  }
  return null;
};

const SalesBreakdown = ({ sales }) => {
  const [view, setView] = useState('chart'); // 'chart' | 'table'

  // Group sales by item name
  const grouped = {};
  sales.forEach(s => {
    if (s.type !== 'sale' || !s.item_name) return;
    const key = s.item_name.trim().toLowerCase();
    if (!grouped[key]) {
      grouped[key] = { item: s.item_name, revenue: 0, qty: 0, count: 0, unit_price: s.unit_price || 0 };
    }
    grouped[key].revenue += parseFloat(s.amount) || 0;
    grouped[key].qty += parseFloat(s.quantity) || 0;
    grouped[key].count += 1;
  });

  const data = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const topItem = data[0];

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-bold text-lg mb-1">Sales Breakdown by Item</h3>
        <p className="text-gray-400 text-sm mb-6">Revenue analysis per product</p>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiShoppingCart className="text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium">No item sales recorded yet</p>
          <p className="text-gray-500 text-sm mt-1">Use "Add Sale" to record sales per item</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Sales Breakdown by Item</h3>
          <p className="text-gray-400 text-sm">Today's revenue per product</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('chart')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'chart'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Top performer banner */}
      {topItem && (
        <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mb-5">
          <FiTrendingUp className="text-orange-500 flex-shrink-0" size={18} />
          <p className="text-sm text-gray-300">
            Top seller today: <span className="text-white font-bold">{topItem.item}</span>
            {' '}&mdash; KES {topItem.revenue.toLocaleString()}
            {' '}({((topItem.revenue / totalRevenue) * 100).toFixed(0)}% of revenue)
          </p>
        </div>
      )}

      {/* Chart view */}
      {view === 'chart' && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="item"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-2 pr-4">Item</th>
                <th className="text-right text-gray-400 font-medium py-2 pr-4">Units Sold</th>
                <th className="text-right text-gray-400 font-medium py-2 pr-4">Unit Price</th>
                <th className="text-right text-gray-400 font-medium py-2 pr-4">Revenue</th>
                <th className="text-right text-gray-400 font-medium py-2">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {data.map((row, i) => (
                <tr key={row.item} className="hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-white font-medium">{row.item}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-300">{row.qty}</td>
                  <td className="py-3 pr-4 text-right text-gray-300">
                    {row.unit_price ? `KES ${row.unit_price.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-right text-green-400 font-bold">
                    KES {row.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(row.revenue / totalRevenue) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length]
                          }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-8 text-right">
                        {((row.revenue / totalRevenue) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-600">
                <td className="py-3 text-white font-bold">Total</td>
                <td />
                <td />
                <td className="py-3 text-right text-green-400 font-bold">
                  KES {totalRevenue.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-400 text-xs">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesBreakdown;
