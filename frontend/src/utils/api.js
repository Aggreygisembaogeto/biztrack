const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getToken = () => localStorage.getItem('biztrack_token');

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('biztrack_token');
        localStorage.removeItem('biztrack_user');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const inventoryAPI = {
  getAll: () => apiRequest('/api/inventory'),
  getOne: (id) => apiRequest(`/api/inventory/${id}`),
  create: (data) => apiRequest('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/inventory/${id}`, { method: 'DELETE' }),
  updateQuantity: (id, quantity, operation) => apiRequest(`/api/inventory/${id}/quantity`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, operation }),
  }),
  getLowStock: () => apiRequest('/api/inventory/low-stock'),
  getStats: () => apiRequest('/api/inventory/stats'),
};

export const salesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/sales${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id) => apiRequest(`/api/sales/${id}`),
  create: (data) => apiRequest('/api/sales', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/api/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/sales/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/api/sales/stats'),
  getByDateRange: (startDate, endDate) => apiRequest(`/api/sales/date-range?startDate=${startDate}&endDate=${endDate}`),
};

export const ordersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/orders${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id) => apiRequest(`/api/orders/${id}`),
  create: (data) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/orders/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) => apiRequest(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getStats: () => apiRequest('/api/orders/stats'),
};

export const transactionsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/transactions${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id) => apiRequest(`/api/transactions/${id}`),
  create: (data) => apiRequest('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/transactions/${id}`, { method: 'DELETE' }),
  getSummary: () => apiRequest('/api/transactions/summary'),
  getStatsByType: () => apiRequest('/api/transactions/stats/type'),
  getStatsByCategory: () => apiRequest('/api/transactions/stats/category'),
};

export const adminAPI = {
  getAllUsers: () => apiRequest('/api/admin/users'),
  getUserDetails: (id) => apiRequest(`/api/admin/users/${id}`),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getPlatformStats: () => apiRequest('/api/admin/stats'),
  getRecentActivity: (limit = 20) => apiRequest(`/api/admin/activity?limit=${limit}`),
};

export { API_URL };
