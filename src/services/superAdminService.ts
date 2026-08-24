import api from './api';

export const superAdminService = {
  getAllSocieties: async ({ page = 1, limit = 10, search = '' }) => {
    const response = await api.get(`/super-admin/societies?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },
  createSocietyAndAdmin: async (data: any) => {
    const response = await api.post('/super-admin/societies', data);
    return response.data;
  },
  toggleSocietyStatus: async (id: string) => {
    const response = await api.patch(`/super-admin/societies/${id}/status`);
    return response.data;
  }
};