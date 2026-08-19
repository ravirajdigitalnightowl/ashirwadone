// src/services/workerService.ts
import api from './api';

export const workerService = {
  // 🔥 UPDATE: Added page, limit, month, and year for Infinite Scrolling & SaaS filtering
  getTasks: async ({ status = 'All', timeRange = 'This Month', month, year, pageParam = 1, limit = 10 }: any) => {
    let url = `/worker/tasks?status=${status}&timeRange=${timeRange}&page=${pageParam}&limit=${limit}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  completeTask: async (data: { ticketId: string; workerNoteForAdmin: string; workerNoteForResident: string }) => {
    const response = await api.patch(`/worker/tasks/${data.ticketId}/complete`, {
      workerNoteForAdmin: data.workerNoteForAdmin,
      workerNoteForResident: data.workerNoteForResident,
    });
    return response.data;
  },

  // Duty On/Off toggle karna
  toggleDuty: async () => {
    const response = await api.patch('/worker/profile/duty');
    return response.data;
  }
};