import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SettingsStorage } from '../utils/storage';
import {
  FiHome, FiBarChart2, FiSettings, FiLogOut,
  FiPackage, FiDollarSign, FiFileText,
  FiMenu, FiX, FiTrendingUp, FiShoppingBag, FiShield, FiCalendar
} from 'react-icons/fi';

const Sidebar = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const settings = SettingsStorage.load();
  const businessLogo = settings.businessLogo;

  // Check if user is super admin (only admin@biztrack.com or users with admin role)
  const isSuperAdmin = user && (
    user.email === 'admin@biztrack.com' || 
    user.role === 'admin'
  );

  // Base menu items (Admin Panel removed - it's now separate)
  const menuItems = [
    { icon: <FiHome size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiCalendar size={18} />, label: 'Daily Tracker', path: '/daily-tracker' },
    { icon: <FiShoppingBag size={18} />, label: 'Orders', path: '/orders' },
    { icon: <FiDollarSign size={18} />, label: 'Financial', path: '/financial' },
    { icon: <FiPackage size={18} />, label: 'Inventory', path: '/inventory' },
    { icon: <FiBarChart2 size={18} />, label: 'Analytics', path: '/analytics' },
    { icon: <FiTrendingUp size={18} />, label: 'Employees', path: '/employees' },
    { icon: <FiFileText size={18} />, label: 'Reports', path: '/reports' },
    { icon: <FiSettings size={18} />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            BizDash
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Nairobi, Kenya</p>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-gray-400 hover:text-white p-1"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              user?.business_name?.charAt(0)?.toUpperCase() || 'B'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.business_name || 'Business'}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Admin Panel Link (if admin) */}
        {isSuperAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => handleNav('/admin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30"
            >
              <FiShield size={18} className="flex-shrink-0" />
              <span className="font-medium">Admin Panel</span>
              <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                ADMIN
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors text-sm"
        >
          <FiLogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          BizDash
        </h2>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white p-1"
        >
          <FiMenu size={22} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 bg-gray-800 border-r border-gray-700 flex-col flex-shrink-0">
        <NavContent />
      </div>
    </>
  );
};

export default Sidebar;
