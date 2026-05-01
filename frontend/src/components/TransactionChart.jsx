import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TransactionChart = () => {
  const data = [
    { hour: '9AM', orders: 12, payments: 10 },
    { hour: '10AM', orders: 18, payments: 15 },
    { hour: '11AM', orders: 25, payments: 22 },
    { hour: '12PM', orders: 35, payments: 32 },
    { hour: '1PM', orders: 42, payments: 38 },
    { hour: '2PM', orders: 28, payments: 25 },
    { hour: '3PM', orders: 22, payments: 20 },
    { hour: '4PM', orders: 30, payments: 28 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.hour}</p>
          <p className="text-orange-500">Orders: {payload[0].value}</p>
          <p className="text-blue-500">Payments: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

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
