import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiActivity } from 'react-icons/fi';

const TransactionChart = () => {
  // No demo data - empty until user has actual data
  const data = [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0]?.payload;
      if (!data) return null;
      
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.hour}</p>
          <p className="text-orange-500">Orders: {data.orders || 0}</p>
          <p className="text-blue-500">Payments: {data.payments || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">Hourly Activity</h3>
          <p className="text-sm text-gray-400">Today's transactions by hour</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiActivity className="text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium">No activity data yet</p>
          <p className="text-gray-500 text-sm mt-1">Start recording transactions to see hourly activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Hourly Activity</h3>
        <p className="text-sm text-gray-400">Today's transactions by hour</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="hour" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
          <Bar dataKey="payments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
