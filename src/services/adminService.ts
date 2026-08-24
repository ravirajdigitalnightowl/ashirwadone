
import api from './api';

export const adminService = {
  // --- TICKET MANAGEMENT ---
  // 🔥 UPDATE: Pagination parameters removed. Default timeRange set to 'This Month'
  getAllTickets: async (status: string = 'All', timeRange: string = 'This Month') => {
    const response = await api.get(`/admin/tickets?status=${status}&timeRange=${timeRange}`);
    return response.data;
  },

  getTicketDetails: async (ticketId: string) => {
    const response = await api.get(`/admin/tickets/${ticketId}`);
    return response.data;
  },

  assignTicket: async (data: { ticketId: string; workerId: string; adminNoteForWorker?: string; adminNoteForResident?: string }) => {
    const response = await api.patch(`/admin/tickets/${data.ticketId}/assign`, {
      workerId: data.workerId,
      adminNoteForWorker: data.adminNoteForWorker,
      adminNoteForResident: data.adminNoteForResident,
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // --- WORKER MANAGEMENT ---
  getAllWorkers: async (search: string = '', department: string = 'All') => {
    let url = `/admin/workers?search=${encodeURIComponent(search)}`;
    if (department !== 'All') {
      url += `&department=${encodeURIComponent(department)}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // --- RESIDENT MANAGEMENT ---
  getAllResidents: async (search: string = '') => {
    const response = await api.get(`/admin/residents?search=${encodeURIComponent(search)}`);
    return response.data;
  },

  toggleUserStatus: async (data: { userId: string; isActive: boolean }) => {
    const response = await api.patch(`/admin/users/${data.userId}/status`, { 
      isActive: data.isActive 
    });
    return response.data;
  },

  updateUser: async (data: { userId: string; updates: any }) => {
    const response = await api.patch(`/admin/users/${data.userId}`, data.updates);
    return response.data;
  },

  toggleWorkerStatus: async (data: { workerId: string; isActive: boolean }) => {
    const response = await api.patch(`/admin/users/${data.workerId}/status`, { 
      isActive: data.isActive 
    });
    return response.data;
  },

  addWorker: async (workerData: { name: string; phone: string; email?: string; department: string; role: string }) => {
    const response = await api.post('/admin/users', workerData); 
    return response.data;
  },

  // --- DEPARTMENT MANAGEMENT ---
  getAllDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },
  
  createDepartment: async (data: { name: string }) => {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },
  
  updateDepartment: async (id: string, data: { name?: string; isActive?: boolean }) => {
    const response = await api.patch(`/admin/departments/${id}`, data);
    return response.data;
  },
};