import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FiDownload, FiFileText, FiDollarSign, FiPackage, FiUsers, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesStorage, ExpensesStorage, InventoryStorage, TransactionsStorage } from '../utils/storage';
import { 
  exportSalesReport, 
  exportExpensesReport, 
  exportInventoryReport, 
  exportTransactionsReport,
  exportProfitLossReport,
  generateSalesPDF,
  generateInventoryPDF
} from '../utils/exportUtils';

const summaryData = [
  { label: 'Total Revenue', value: 'KES 450,000', sub: 'This month', color: 'text-green-400', bg: 'bg-green-500/10', icon: <FiDollarSign /> },
  { label: 'Total Expenses', value: 'KES 162,000', sub: 'This month', color: 'text-red-400', bg: 'bg-red-500/10', icon: <FiTrendingUp /> },
  { label: 'Net Profit', value: 'KES 288,000', sub: '64% margin', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <FiDollarSign /> },
  { label: 'Total Customers', value: '310', sub: '+47 this month', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: <FiUsers /> },
];

const weeklyChart = [
  { week: 'Week 1', revenue: 95000, expenses: 34000 },
  { week: 'Week 2', revenue: 112000, expenses: 41000 },
  { week: 'Week 3', revenue: 108000, expenses: 38000 },
  { week: 'Week 4', revenue: 135000, expenses: 49000 },
];

const reportTypes = [
  { id: 'sales', label: 'Sales Report', desc: 'All sales transactions with item breakdown', icon: <FiDollarSign />, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'expenses', label: 'Expense Report', desc: 'All expenses categorized by type', icon: <FiTrendingUp />, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'inventory', label: 'Inventory Report', desc: 'Stock levels, value and movement', icon: <FiPackage />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'customers', label: 'Customer Report', desc: 'Customer activity and spending', icon: <FiUsers />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'profit', label: 'Profit & Loss', desc: 'Full P&L statement for the period', icon: <FiFileText />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'payroll', label: 'Payroll Report', desc: 'Employee salaries and attendance', icon: <FiUsers />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

const Reports = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-29');

  // Load data from storage
  const sales = SalesStorage.load();
  const expenses = ExpensesStorage.load();
  const inventory = InventoryStorage.load();
  const transactions = TransactionsStorage.load();

  const handleDownload = (reportId, format = 'pdf') => {
    try {
      if (format === 'csv') {
        switch (reportId) {
          case 'sales':
            exportSalesReport(sales);
            break;
          case 'expenses':
            exportExpensesReport(expenses);
            break;
          case 'inventory':
            exportInventoryReport(inventory);
            break;
          case 'customers':
            exportTransactionsReport(transactions);
            break;
          case 'profit':
            exportProfitLossReport(sales, expenses);
            break;
          default:
            exportTransactionsReport(transactions);
        }
        toast.success(`${reportId} CSV report downloaded!`);
      } else {
        // PDF generation
        switch (reportId) {
          case 'sales':
            generateSalesPDF(sales);
            break;
          case 'inventory':
            generateInventoryPDF(inventory);
            break;
          default:
            toast.info('PDF generation for this report coming soon!');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleExportAll = () => {
    toast.info('Exporting all reports...');
    setTimeout(() => {
      exportSalesReport(sales);
      exportExpensesReport(expenses);
      exportInventoryReport(inventory);
      exportProfitLossReport(sales, expenses);
      toast.success('All reports exported successfully!');
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />
      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 text-sm mt-1">Generate and export business reports</p>
          </div>
          <button onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg">
            <FiDownload /> Export All
          </button>
        </div>

        {/* Period Selector */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {['today', 'week', 'month', 'year', 'custom'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    period === p ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <FiCalendar className="text-gray-400" />
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <span className="text-gray-400 text-sm">to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryData.map((s, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className={`p-2 rounded-lg ${s.bg} ${s.color} w-fit mb-3`}>{s.icon}</div>
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">Weekly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={v => [`KES ${v.toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Report Types */}
        <h3 className="text-white font-bold text-lg mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map(r => (
            <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col gap-3 hover:border-orange-500/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${r.bg} ${r.color} flex-shrink-0`}>{r.icon}</div>
                <div>
                  <h4 className="text-white font-semibold">{r.label}</h4>
                  <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleDownload(r.id, 'pdf')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm rounded-lg transition-all shadow">
                  <FiDownload size={14} /> Download PDF
                </button>
                <button onClick={() => handleDownload(r.id, 'csv')}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Reports;

