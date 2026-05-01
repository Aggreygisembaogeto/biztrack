import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem('biztrack_token');
        const savedUser = localStorage.getItem('biztrack_user');

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        localStorage.removeItem('biztrack_token');
        localStorage.removeItem('biztrack_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        localStorage.setItem('biztrack_token', newToken);
        localStorage.setItem('biztrack_user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        toast.success('Login successful!');
        return { success: true };
      }
      
      toast.error(response.data.message || 'Login failed');
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false };
    }
  };

  const register = async (email, password, business_name, phone = '', address = '') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: email.trim().toLowerCase(),
        password,
        business_name: business_name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        localStorage.setItem('biztrack_token', newToken);
        localStorage.setItem('biztrack_user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        toast.success('Registration successful!');
        return { success: true };
      }
      
      toast.error(response.data.message || 'Registration failed');
      return { success: false };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('biztrack_token');
    localStorage.removeItem('biztrack_user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const loginAsDemo = async () => {
    // Demo login - just use regular login with demo credentials
    return await login('demo@biztrack.com', 'demo123');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    loginAsDemo
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
