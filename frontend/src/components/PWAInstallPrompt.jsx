import React, { useState, useEffect } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-orange-500 rounded-xl p-4 shadow-2xl z-50 max-w-sm animate-slideUp">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        <FiX size={18} />
      </button>
      
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <FiDownload className="text-orange-500 text-xl" />
        </div>
        <div>
          <h3 className="text-white font-bold">Install BizTrack</h3>
          <p className="text-gray-400 text-sm mt-1">
            Install our app for quick access and offline support!
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium text-sm"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
