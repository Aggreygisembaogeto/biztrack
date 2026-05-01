import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiLock, FiBell, FiGlobe, FiDollarSign, FiSave, FiMail, FiPhone, FiMapPin, FiSun, FiMoon, FiImage, FiDownload, FiUpload } from 'react-icons/fi';
import { SettingsStorage, BackupStorage } from '../utils/storage';

const Settings = () => {
  const { user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const user = authUser || {
    id: 1,
    business_name: 'Demo Restaurant',
    email: 'demo@restaurant.com',
    phone: '254712345678',
    location: 'Nairobi, Kenya'
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [businessLogo, setBusinessLogo] = useState(() => {
    const settings = SettingsStorage.load();
    return settings.businessLogo || '';
  });
  const [profileData, setProfileData] = useState({
    business_name: user.business_name,
    email: user.email,
    phone: user.phone || '',
    location: user.location || '',
    currency: 'KES',
    timezone: 'Africa/Nairobi'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    dailySummary: true,
    lowStockAlerts: false
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully.');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    toast.success('Password updated successfully.');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved.');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setBusinessLogo(base64);
        SettingsStorage.update({ businessLogo: base64 });
        toast.success('Logo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setBusinessLogo('');
    SettingsStorage.update({ businessLogo: '' });
    toast.success('Logo removed');
  };

  const handleExportBackup = () => {
    try {
      const backup = BackupStorage.exportAll();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biztrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export backup');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target.result);
          const result = BackupStorage.importAll(backup);
          if (result.success) {
            toast.success('Backup restored successfully! Refreshing...');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            toast.error('Failed to restore backup: ' + result.error);
          }
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Invalid backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'preferences', label: 'Preferences', icon: <FiGlobe /> }
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={user} />
      
      <div className="flex-1 pt-16 md:pt-0 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="business_name"
                      value={profileData.business_name}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                <FiSave />
                Save Changes
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                <FiSave />
                Update Password
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-400">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'smsNotifications' && 'Receive notifications via SMS'}
                        {key === 'transactionAlerts' && 'Get alerts for new transactions'}
                        {key === 'dailySummary' && 'Daily business summary report'}
                        {key === 'lowStockAlerts' && 'Alerts when stock is low'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleNotificationChange(key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                <FiSave />
                Save Preferences
              </button>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-white mb-4">Business Preferences</h2>
              
              {/* Theme Toggle */}
              <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  {theme === 'dark' ? <FiMoon /> : <FiSun />}
                  Appearance
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Theme</p>
                    <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <FiSun className="text-yellow-500" />
                        <span className="text-white">Light Mode</span>
                      </>
                    ) : (
                      <>
                        <FiMoon className="text-blue-500" />
                        <span className="text-white">Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Business Logo */}
              <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FiImage />
                  Business Logo
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-gray-500">
                    {businessLogo ? (
                      <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-400">{user?.business_name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors"
                      >
                        <FiUpload />
                        Upload Logo
                      </label>
                      {businessLogo && (
                        <button
                          onClick={handleRemoveLogo}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-2">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FiDownload />
                  Backup & Restore
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Export all your data as a backup file or restore from a previous backup
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <FiDownload />
                    Export Backup (JSON)
                  </button>
                  
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                    id="backup-upload"
                  />
                  <label
                    htmlFor="backup-upload"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer font-medium transition-colors"
                  >
                    <FiUpload />
                    Import Backup
                  </label>
                  
                  <p className="text-gray-400 text-xs">
                    ⚠️ Importing a backup will replace all current data. Make sure to export your current data first!
                  </p>
                </div>
              </div>

              {/* Currency & Timezone */}
              <div className="bg-gray-700/50 rounded-xl border border-gray-600 p-6">
                <h3 className="text-white font-bold mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="currency"
                        value={profileData.currency}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="timezone"
                        value={profileData.timezone}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                <FiSave />
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

