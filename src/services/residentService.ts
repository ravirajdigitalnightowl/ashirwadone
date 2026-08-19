
import api from './api';

export const residentService = {
  // Complaint create karna (Cloudinary upload ke liye FormData use hoga)
  createTicket: async (formData: FormData) => {
    const response = await api.post('/resident/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 🔥 UPDATE: Removed page and limit params, updated endpoint URL
  getMyTickets: async (status: string = 'All', timeRange: string = 'This Month') => {
    const response = await api.get(`/resident/tickets?status=${status}&timeRange=${timeRange}`);
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