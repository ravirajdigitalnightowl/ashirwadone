// src/services/adminService.ts
import api from './api';

export const adminService = {
  // --- TICKET MANAGEMENT ---
  // 🔥 UPDATE: Added page, limit, month, and year for Infinite Scrolling & SaaS filtering
  getAllTickets: async ({ status = 'All', timeRange = 'This Month', month, year, pageParam = 1, limit = 10 }: any) => {
    let url = `/admin/tickets?status=${status}&timeRange=${timeRange}&page=${pageParam}&limit=${limit}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
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

  // --- ATTENDANCE MANAGEMENT (🔥 NEW SAAS FEATURE) ---
  getAttendanceReport: async ({ date, month, year, pageParam = 1, limit = 10 }: any) => {
    let url = `/admin/attendance?page=${pageParam}&limit=${limit}`;
    if (date) url += `&date=${date}`;
    else if (month && year) url += `&month=${month}&year=${year}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // --- WORKER MANAGEMENT ---
  // 🔥 UPDATE: Added pagination parameters
  getAllWorkers: async ({ search = '', department = 'All', pageParam = 1, limit = 10 }: any) => {
    let url = `/admin/workers?search=${encodeURIComponent(search)}&page=${pageParam}&limit=${limit}`;
    if (department !== 'All') {
      url += `&department=${encodeURIComponent(department)}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  toggleWorkerStatus: async (data: { workerId: string; isActive: boolean }) => {
    const response = await api.patch(`/admin/users/${data.workerId}/status`, { 
      isActive: data.isActive 
    });
    return response.data;
  },

  addWorker: async (workerData: { name: string; phone: string; email?: string; department: string; role: string; shiftStart?: string; shiftEnd?: string; aadharNo?: string; photoUrl?: string }) => {
    const response = await api.post('/admin/users', workerData); 
    return response.data;
  },

  // --- RESIDENT MANAGEMENT ---
  // 🔥 UPDATE: Added pagination parameters
  getAllResidents: async ({ search = '', pageParam = 1, limit = 10 }: any) => {
    const response = await api.get(`/admin/residents?search=${encodeURIComponent(search)}&page=${pageParam}&limit=${limit}`);
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