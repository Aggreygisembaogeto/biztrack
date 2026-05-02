import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Inventory from './pages/Inventory';
import FinancialTransactions from './pages/FinancialTransactions';
import Analytics from './pages/Analytics';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import AdminPanel from './pages/AdminPanel';
import DailyTracker from './pages/DailyTracker';
import EnvTest from './pages/EnvTest';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-900">
      <NetworkStatus />
      <Routes>
        <Route path="/env-test" element={<EnvTest />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={
          user ? (
            isAdmin ? <AdminPanel /> : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/daily-tracker" element={user ? <DailyTracker /> : <Navigate to="/login" replace />} />
        <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
        <Route path="/financial" element={user ? <FinancialTransactions /> : <Navigate to="/login" replace />} />
        <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" replace />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" replace />} />
        <Route path="/employees" element={user ? <Employees /> : <Navigate to="/login" replace />} />
        <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
