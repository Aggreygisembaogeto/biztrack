import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon, color, trend, subtitle }) => {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveTrend ? <FiTrendingUp /> : <FiTrendingDown />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatsCard;
