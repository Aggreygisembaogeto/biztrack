import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

const RevenueChart = () => {
  // No demo data - empty until user has actual data
  const data = [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.day}</p>
          <p className="text-orange-500">Revenue: KES {data.revenue?.toLocaleString() || 0}</p>
          <p className="text-blue-500">Transactions: {data.transactions || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
          <p className="text-sm text-gray-400">Last 7 days performance</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiTrendingUp className="text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium">No revenue data yet</p>
          <p className="text-gray-500 text-sm mt-1">Start recording sales to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
        <p className="text-sm text-gray-400">Last 7 days performance</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#f97316" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
