// src/services/residentService.ts
import api from './api';

export const residentService = {
  // Complaint create karna (Cloudinary upload ke liye FormData use hoga)
  createTicket: async (formData: FormData) => {
    const response = await api.post('/resident/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 🔥 UPDATE: Added page, limit, month, and year for Infinite Scrolling & SaaS filtering
  getMyTickets: async ({ status = 'All', timeRange = 'This Month', month, year, pageParam = 1, limit = 10 }: any) => {
    let url = `/resident/tickets?status=${status}&timeRange=${timeRange}&page=${pageParam}&limit=${limit}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 🔥 NEW SAAS FEATURE: Digital Notice Board / Posts fetch karna
  getAllPosts: async ({ type = 'All', month, year, pageParam = 1, limit = 10 }: any) => {
    let url = `/resident/posts?page=${pageParam}&limit=${limit}`;
    if (type && type !== 'All') {
      url += `&type=${type}`;
    }
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Profile edit karna
  updateProfile: async (userData: { name?: string; phone?: string }) => {
    const response = await api.patch('/user/update-me', userData);
    return response.data;
  },
  
  // Active Categories (Departments) fetch karne ke liye
  getCategories: async () => {
    const response = await api.get('/resident/categories');
    return response.data;
  },
};