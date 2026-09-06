import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ats_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ats_token');
      localStorage.removeItem('ats_user');
      window.dispatchEvent(new Event('auth-changed'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  sendOtp: async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  },
  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const atsApi = {
  getRoles: async () => {
    const res = await api.get('/ats/roles');
    return res.data;
  },
  analyzeResume: async (formData) => {
    const res = await api.post('/ats/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/ats/history');
    return res.data;
  },
  getScanDetail: async (id) => {
    const res = await api.get(`/ats/history/${id}`);
    return res.data;
  },
};

export default api;
