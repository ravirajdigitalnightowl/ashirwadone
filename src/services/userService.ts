import api from './api';

export const userService = {
  // Token save karne ke liye (Push Notifications ke liye)
  updateFcmToken: async (fcmToken: string) => {
    const response = await api.patch('/auth/update-fcm-token', { fcmToken });
    return response.data;
  }
};