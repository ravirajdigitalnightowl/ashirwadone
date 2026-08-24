
import api from './api';

export const workerService = {
  // 🔥 UPDATE: Removed page and limit params, updated endpoint URL
  getTasks: async (status: string = 'All', timeRange: string = 'This Month') => {
    const response = await api.get(`/worker/tasks?status=${status}&timeRange=${timeRange}`);
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