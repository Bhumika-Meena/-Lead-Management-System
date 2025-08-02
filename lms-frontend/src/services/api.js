import axios from 'axios';

const API_BASE_URL = 'https://lead-management-system-vzgu.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  // Mocked confirmation flows:
  requestEmailChange: (newEmail) => Promise.resolve({ data: { message: 'Confirmation email sent', token: 'mock-email-token' } }),
  confirmEmailChange: (token) => Promise.resolve({ data: { message: 'Email changed successfully' } }),
  requestPhoneChange: (newPhone) => Promise.resolve({ data: { message: 'Confirmation SMS sent', token: 'mock-phone-token' } }),
  confirmPhoneChange: (token) => Promise.resolve({ data: { message: 'Phone changed successfully' } }),
  requestPasswordChange: () => Promise.resolve({ data: { message: 'Password reset email sent', token: 'mock-password-token' } }),
  confirmPasswordChange: (token, newPassword) => Promise.resolve({ data: { message: 'Password changed successfully' } }),
};

// Leads API
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (leadData) => api.post('/leads', leadData),
  update: (id, leadData) => api.put(`/leads/${id}`, leadData),
  delete: (id) => api.delete(`/leads/${id}`),
  assign: (id, userId) => api.put(`/leads/${id}/assign`, { assigned_to: userId }),
};

// Activities API
export const activitiesAPI = {
  getByLeadId: (leadId) => api.get(`/leads/${leadId}/activities`),
  create: (leadId, activityData) => api.post(`/leads/${leadId}/activities`, activityData),
  delete: (leadId, activityId) => api.delete(`/leads/${leadId}/activities/${activityId}`),
  update: (leadId, activityId, data) => api.put(`/leads/${leadId}/activities/${activityId}`, data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const otpAPI = {
  requestEmailChange: (email) => api.post('/otp/request-email-change', { email }),
  confirmEmailChange: (otp, otpToken) => api.post('/otp/confirm-email-change', { otp, otpToken }),
  requestPasswordChange: (newPassword) => api.post('/otp/request-password-change', { newPassword }),
  confirmPasswordChange: (otp, otpToken) => api.post('/otp/confirm-password-change', { otp, otpToken }),
};

export default api; 
