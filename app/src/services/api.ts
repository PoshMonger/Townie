import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-url.com/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { email: string; password: string; username: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const businessAPI = {
  getNearby: (lat: number, lng: number, radius = 10, category?: string) =>
    api.get('/businesses/nearby', { params: { lat, lng, radius, category } }),
  getById: (id: string) => api.get(`/businesses/${id}`),
  search: (q: string) => api.get('/businesses/search', { params: { q } }),
  getHotDeals: (lat?: number, lng?: number, radius = 25) =>
    api.get('/businesses/hot-deals', { params: { lat, lng, radius } }),
};

export const submissionAPI = {
  create: (formData: FormData) =>
    api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMine: () => api.get('/submissions/mine'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingSubmissions: () => api.get('/admin/submissions/pending'),
  reviewSubmission: (id: string, status: 'approved' | 'rejected', review_notes?: string) =>
    api.post(`/admin/submissions/${id}/review`, { status, review_notes }),
  createBusiness: (formData: FormData) =>
    api.post('/admin/businesses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBusiness: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/businesses/${id}`, data),
  deleteBusiness: (id: string) => api.delete(`/admin/businesses/${id}`),
};

export default api;
