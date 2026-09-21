/**
 * AFLAX Restaurant Central API Service Foundation
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');


/**
 * Generic request wrapper with basic error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Automatically attach admin token for authenticated admin requests
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('aflax_admin_token') : null;
  if (adminToken) {
    defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      console.error(`[API Network Error] Unable to connect to ${url}:`, error.message);
      const networkError = new Error('Server-ka lama xiriiri karin (API unavailable)');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

/**
 * Health check service
 */
export async function checkHealth() {
  return apiRequest('/health', { method: 'GET' });
}

/**
 * Category API service
 */
export const categoryService = {
  getAll: () => apiRequest('/categories', { method: 'GET' }),
  getById: (id) => apiRequest(`/categories/${id}`, { method: 'GET' }),
};

/**
 * Menu API service
 */
export const menuService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.available !== undefined) query.append('available', params.available);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/menu${queryString}`, { method: 'GET' });
  },
  getById: (id) => apiRequest(`/menu/${id}`, { method: 'GET' }),
  getByCategory: (categoryId) => apiRequest(`/menu/category/${categoryId}`, { method: 'GET' }),
};

/**
 * Future services prepared for later phases
 */
export const bookingService = {
  create: (bookingData) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getById: (id) => apiRequest(`/bookings/${id}`, { method: 'GET' }),
};

export const orderService = {
  create: (orderData) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getById: (id) => apiRequest(`/orders/${id}`, { method: 'GET' }),
};

export const adminService = {
  login: (credentials) =>
    apiRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => apiRequest('/admin/auth/me', { method: 'GET' }),
  getDashboard: () => apiRequest('/admin/dashboard', { method: 'GET' }),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams();
    if (params.range) query.append('range', params.range);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/analytics${qs}`, { method: 'GET' });
  },
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/orders${qs}`, { method: 'GET' });
  },
  updateOrderStatus: (id, status) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.dateFilter) query.append('dateFilter', params.dateFilter);
    if (params.date) query.append('date', params.date);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/bookings${qs}`, { method: 'GET' });
  },
  updateBookingStatus: (id, status) =>
    apiRequest(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getMenu: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/menu${qs}`, { method: 'GET' });
  },
  createMenuItem: (data) =>
    apiRequest('/admin/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMenuItem: (id, data) =>
    apiRequest(`/admin/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteMenuItem: (id) =>
    apiRequest(`/admin/menu/${id}`, {
      method: 'DELETE',
    }),
  toggleMenuItemAvailability: (id, isAvailable) =>
    apiRequest(`/admin/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),
  getCategories: () => apiRequest('/admin/categories', { method: 'GET' }),
  createCategory: (data) =>
    apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id, data) =>
    apiRequest(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id) =>
    apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  getSettings: () => apiRequest('/admin/settings', { method: 'GET' }),
  updateSettings: (data) =>
    apiRequest('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const settingsService = {
  getPublicSettings: () => apiRequest('/settings', { method: 'GET' }),
};

export default {
  checkHealth,
  categoryService,
  menuService,
  bookingService,
  orderService,
  adminService,
  settingsService,
};

