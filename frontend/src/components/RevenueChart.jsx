import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RevenueChart = () => {
  // Sample data for the last 7 days
  const data = [
    { day: 'Mon', revenue: 12000, transactions: 45 },
    { day: 'Tue', revenue: 15000, transactions: 52 },
    { day: 'Wed', revenue: 13500, transactions: 48 },
    { day: 'Thu', revenue: 18000, transactions: 65 },
    { day: 'Fri', revenue: 22000, transactions: 78 },
    { day: 'Sat', revenue: 25000, transactions: 85 },
    { day: 'Sun', revenue: 15000, transactions: 55 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.day}</p>
          <p className="text-orange-500">Revenue: KES {payload[0].value.toLocaleString()}</p>
          <p className="text-blue-500">Transactions: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

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
