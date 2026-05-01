import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi } from 'react-icons/fi';
import { toast } from 'react-toastify';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
      toast.success('Connection restored!', { autoClose: 2000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
      toast.error('No internet connection', { autoClose: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
      <FiWifiOff className="text-xl" />
      <span className="font-medium">No internet connection. Please check your network.</span>
    </div>
  );
};

export default NetworkStatus;
