import React from 'react';
import { FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const FilterBar = ({ filters, setFilters }) => {
  const handleExport = () => {
    toast.success('Exporting data...');
    // TODO: Implement export functionality
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="order">Orders Only</option>
            <option value="payment">Payments Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg"
        >
          <FiDownload />
          Export
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
