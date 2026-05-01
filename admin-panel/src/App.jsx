import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_user');
    const savedToken = localStorage.getItem('admin_token');
    
    if (savedAdmin && savedToken) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (adminData, token) => {
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    localStorage.setItem('admin_token', token);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    setAdmin(null);
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {admin ? (
        <Dashboard admin={admin} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
    </>
  );
}

export default App;
