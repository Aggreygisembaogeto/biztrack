import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SettingsStorage } from '../utils/storage';
import ThemeToggle from './ThemeToggle';
import {
  FiHome, FiBarChart2, FiSettings, FiLogOut,
  FiPackage, FiDollarSign, FiFileText,
  FiMenu, FiX, FiTrendingUp, FiShoppingBag, FiShield, FiCalendar, FiChevronRight
} from 'react-icons/fi';

const Sidebar = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const settings = SettingsStorage.load();
  const businessLogo = settings.businessLogo;

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Check if user is admin - STRICT CHECK
  const isAdmin = user && user.role === 'admin';

  // Base menu items (Admin Panel removed - it's now separate)
  const menuItems = [
    { icon: <FiHome size={20} />, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: <FiCalendar size={20} />, label: 'Daily Tracker', path: '/daily-tracker', badge: null },
    { icon: <FiShoppingBag size={20} />, label: 'Orders', path: '/orders', badge: null },
    { icon: <FiDollarSign size={20} />, label: 'Financial', path: '/financial', badge: null },
    { icon: <FiPackage size={20} />, label: 'Inventory', path: '/inventory', badge: null },
    { icon: <FiBarChart2 size={20} />, label: 'Analytics', path: '/analytics', badge: null },
    { icon: <FiTrendingUp size={20} />, label: 'Employees', path: '/employees', badge: null },
    { icon: <FiFileText size={20} />, label: 'Reports', path: '/reports', badge: null },
    { icon: <FiSettings size={20} />, label: 'Settings', path: '/settings', badge: null },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'BizDash';
  };

  const NavContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-5 border-b border-gray-700 dark:border-gray-700 flex items-center justify-between ${isMobile ? 'bg-gray-900 dark:bg-gray-900' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden shadow-lg">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              'B'
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              BizDash
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Nairobi, Kenya</p>
          </div>
        </div>
        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white dark:hover:text-white p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700 dark:border-gray-700 bg-gray-900/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden ring-2 ring-orange-500/20">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              user?.business_name?.charAt(0)?.toUpperCase() || 'B'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white dark:text-white font-semibold text-sm truncate">{user?.business_name || 'Business'}</p>
            <p className="text-gray-400 dark:text-gray-400 text-xs truncate">{user?.email || ''}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs font-medium">
                Admin
              </span>
            )}
          </div>
        </div>
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 dark:text-gray-400">Theme</span>
          <ThemeToggle />
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white active:scale-95'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <FiChevronRight className="flex-shrink-0 animate-pulse" size={16} />
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Admin Panel Link - ONLY for users with role='admin' */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleNav('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 active:scale-95"
            >
              <FiShield size={20} className="flex-shrink-0" />
              <span className="font-medium flex-1 text-left">Admin Panel</span>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                ADMIN
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all text-sm font-medium active:scale-95"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar - Enhanced */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {getCurrentPageTitle()}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user?.business_name || 'BizDash'}</p>
            </div>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-lg">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              user?.business_name?.charAt(0)?.toUpperCase() || 'B'
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay - Enhanced */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer - Enhanced */}
      <div 
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent isMobile={true} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0">
        <NavContent isMobile={false} />
      </div>
    </>
  );
};

export default Sidebar;
