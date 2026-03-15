/**
 * API Service
 * Centralized axios instance with auth interceptor
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studyhub_token');
      localStorage.removeItem('studyhub_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Materials ────────────────────────────────────────────────────────────────
export const materialService = {
  getAll: (params) => api.get('/materials', { params }),
  getOne: (id) => api.get(`/materials/${id}`),
  getCategories: () => api.get('/materials/categories'),
  upload: (formData, onProgress) => api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
  }),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  download: (id) => api.post(`/materials/${id}/download`, {}, { responseType: 'blob' }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  updateMembership: (id, data) => api.put(`/admin/users/${id}/membership`, data),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentService = {
  getConfig: () => api.get('/payment/config'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsService = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactService = {
  send: (data) => api.post('/contact', data),
};
