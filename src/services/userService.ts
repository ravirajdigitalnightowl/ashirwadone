// src/services/userService.ts
import api from './api';

export const userService = {
  // Token save/clear karne ke liye (Push Notifications ke liye)
  // 🔥 UPDATE: Fixed the endpoint to match the new backend route and allowed null
  updateFcmToken: async (fcmToken: string | null) => {
    const response = await api.patch('/auth/update-fcm', { fcmToken });
    return response.data;
  }
};