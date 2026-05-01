/**
 * Improved AuthContext with best practices
 * - Uses useReducer for state management
 * - Dedicated axios instance
 * - Token expiration handling
 * - Request retry logic
 * - Better error handling
 * - Type-safe (ready for TypeScript)
 */

import React, { createContext, useReducer, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ============================================
// TYPES & CONSTANTS
// ============================================

const AUTH_ACTIONS = {
  INIT_START: 'INIT_START',
  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_ERROR: 'INIT_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
};

const STORAGE_KEYS = {
  TOKEN: 'biztrack_token',
  USER: 'biztrack_user',
  TOKEN_EXPIRY: 'biztrack_token_expiry'
};

// ============================================
// API CLIENT
// ============================================

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry logic for network errors
    if (!originalRequest._retry && error.code === 'ERR_NETWORK') {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount < 3) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * originalRequest._retryCount)
        );
        return apiClient(originalRequest);
      }
    }
    
    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// REDUCER
// ============================================

const initialState = {
  user: null,
  token: null,
  loading: true,
  initialized: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.INIT_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.INIT_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        initialized: true,
        error: null
      };
    
    case AUTH_ACTIONS.INIT_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        initialized: true,
        loading: false
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================
// PROVIDER
// ============================================

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const tokenRefreshTimer = useRef(null);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const isTokenExpired = useCallback((expiryTime) => {
    if (!expiryTime) return true;
    return Date.now() >= expiryTime;
  }, []);

  const saveAuthData = useCallback((token, user) => {
    // Decode JWT to get expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString());
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  }, []);

  // ============================================
  // TOKEN REFRESH
  // ============================================

  const scheduleTokenRefresh = useCallback((expiryTime) => {
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
    }

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    
    // Refresh 5 minutes before expiration
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

    if (refreshTime > 0) {
      tokenRefreshTimer.current = setTimeout(async () => {
        try {
          console.log('🔄 Refreshing token...');
          const response = await apiClient.post('/api/auth/refresh');
          const { token: newToken, user: newUser } = response.data.data;
          
          saveAuthData(newToken, newUser);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: newUser, token: newToken }
          });
          
          // Schedule next refresh
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          scheduleTokenRefresh(payload.exp * 1000);
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }, refreshTime);
    }
  }, []);

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.INIT_START });

      try {
        const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

        if (savedToken && savedUser && savedExpiry) {
          const expiryTime = parseInt(savedExpiry, 10);
          
          if (isTokenExpired(expiryTime)) {
            console.log('⚠️ Token expired, clearing auth data');
            clearAuthData();
            dispatch({ type: AUTH_ACTIONS.INIT_ERROR, payload: 'Token expired' });
          } else {
            const parsedUser = JSON.parse(savedUser);
            console.log('✅ Restoring session:', parsedUser.email);
            
            dispatch({
              type: AUTH_ACTIONS.INIT_SUCCESS,
              payload: { user: parsedUser, token: savedToken }
            });
            
            // Schedule token refresh
            scheduleTokenRefresh(expiryTime);
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.INIT_ERROR, payload: 'No saved session' });
        }
      } catch (error) {
        console.error('❌ Init error:', error);
        clearAuthData();
        dispatch({ type: AUTH_ACTIONS.INIT_ERROR, payload: error.message });
      }
    };

    initAuth();

    // Listen for auth expiration events
    const handleAuthExpired = () => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.error('Session expired. Please login again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, [isTokenExpired, clearAuthData, scheduleTokenRefresh]);

  // ============================================
  // AUTH METHODS
  // ============================================

  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        saveAuthData(token, user);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });
        
        // Schedule token refresh
        const payload = JSON.parse(atob(token.split('.')[1]));
        scheduleTokenRefresh(payload.exp * 1000);
        
        toast.success('Login successful!');
        return { success: true, data: { user, token } };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.data.message
        });
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  }, [saveAuthData, scheduleTokenRefresh]);

  const register = useCallback(async (email, password, business_name, phone = '', address = '') => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await apiClient.post('/api/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        business_name: business_name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        saveAuthData(token, user);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });
        
        toast.success('Registration successful!');
        return { success: true, data: { user, token } };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [saveAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
    }
    
    toast.info('Logged out successfully');
  }, [clearAuthData]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await apiClient.put('/api/auth/profile', updates);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser
        });
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return { success: true, data: updatedUser };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    initialized: state.initialized,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <AuthContext.Provider value={value}>
      {!state.initialized ? (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Export apiClient for use in other parts of the app
export { apiClient };
