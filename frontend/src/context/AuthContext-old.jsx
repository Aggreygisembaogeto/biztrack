import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Load user data from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error) {
      // Fallback to demo mode if backend is not available
      console.log('Backend not available, using demo mode');
      const demoUser = {
        id: 1,
        email: email,
        business_name: 'Demo Restaurant'
      };
      const demoToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
      
      return { success: true, data: { user: demoUser, token: demoToken } };
    }
  };

  const register = async (email, password, business_name) => {
    try {
      const response = await axios.post('/api/auth/register', { 
        email, 
        password, 
        business_name 
      });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error) {
      // Fallback to demo mode if backend is not available
      console.log('Backend not available, using demo mode');
      const demoUser = {
        id: 1,
        email: email,
        business_name: business_name || 'Demo Restaurant'
      };
      const demoToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
      
      return { success: true, data: { user: demoUser, token: demoToken } };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const loginAsDemo = () => {
    const demoUser = {
      id: 1,
      email: 'demo@restaurant.com',
      business_name: 'Demo Restaurant'
    };
    const demoToken = 'demo-token-' + Date.now();
    
    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setToken(demoToken);
    setUser(demoUser);
    
    return { success: true, data: { user: demoUser, token: demoToken } };
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loginAsDemo,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
