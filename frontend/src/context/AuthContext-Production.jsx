import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: () => {},
      loginAsDemo: () => ({ success: false })
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('biztrack_token');
        const savedUser = localStorage.getItem('biztrack_user');

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('biztrack_token');
        localStorage.removeItem('biztrack_user');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        // Save to state
        setToken(newToken);
        setUser(newUser);
        
        // Save to localStorage
        localStorage.setItem('biztrack_token', newToken);
        localStorage.setItem('biztrack_user', JSON.stringify(newUser));
        
        toast.success('Login successful!');
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, business_name, phone = '', address = '') => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', { 
        email: email.trim().toLowerCase(), 
        password,
        business_name: business_name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        // Save to state
        setToken(newToken);
        setUser(newUser);
        
        // Save to localStorage
        localStorage.setItem('biztrack_token', newToken);
        localStorage.setItem('biztrack_user', JSON.stringify(newUser));
        
        toast.success('Registration successful!');
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('biztrack_token');
      localStorage.removeItem('biztrack_user');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loginAsDemo = () => {
    try {
      const demoUser = {
        id: 'demo',
        email: 'demo@biztrack.com',
        business_name: 'Demo Business'
      };
      const demoToken = 'demo-token-' + Date.now();
      
      // Save to state
      setToken(demoToken);
      setUser(demoUser);
      
      // Save to localStorage
      localStorage.setItem('biztrack_token', demoToken);
      localStorage.setItem('biztrack_user', JSON.stringify(demoUser));
      
      toast.success('Logged in as demo user');
      return { success: true, data: { user: demoUser, token: demoToken } };
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login failed');
      return { success: false };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('biztrack_user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return { success: true, data: updatedUser };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loginAsDemo,
    updateProfile,
    changePassword,
    loading,
    initialized
  };

  // Don't render children until initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
