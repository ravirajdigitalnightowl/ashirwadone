
import api from './api';

export const visitorService = {
  // Guard: Request entry for a visitor (Photo ke saath FormData support)
  requestEntry: async (formData: FormData) => {
    const response = await api.post('/visitors/request-entry', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });
    return response.data;
  },

  // 🔥 UPDATE: Removed page and limit parameters
  getActiveVisitors: async (timeRange: string = 'Today') => {
    const response = await api.get(`/visitors/active?timeRange=${encodeURIComponent(timeRange)}`);
    return response.data;
  },

  // Guard/Admin: Mark visitor as exited
  markExit: async (visitorId: string) => {
    const response = await api.patch(`/visitors/${visitorId}/exit`);
    return response.data;
  },

  // Resident: Approve or Deny entry
  respondToEntry: async (data: { visitorId: string; status: 'Approved' | 'Denied' }) => {
    const response = await api.patch(`/visitors/${data.visitorId}/respond`, { status: data.status });
    return response.data;
  },
   
  // Resident: Invite a guest (Generate Passcode)
  inviteVisitor: async (data: any) => {
    const response = await api.post('/visitors/invite', data);
    return response.data;
  },

  // Guard: Verify passcode and allow entry
  verifyPasscode: async (passcode: string) => {
    const response = await api.post('/visitors/verify-passcode', { passcode });
    return response.data;
  },
  
  // 🔥 UPDATE: Removed page and limit parameters
  getMyVisitors: async (timeRange: string = 'Today') => {
    const response = await api.get(`/visitors/my-visitors?timeRange=${encodeURIComponent(timeRange)}`);
    return response.data;
  },
};