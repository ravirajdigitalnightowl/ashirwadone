// src/hooks/useUser.ts
import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/userService';

// Hook: Save or Clear Device Token in DB
export const useUpdateFcmToken = () => {
  return useMutation({
    // 🔥 UPDATE: Explicitly typing to accept string | null for logout scenarios
    mutationFn: (fcmToken: string | null) => userService.updateFcmToken(fcmToken),
    onSuccess: (_, variables) => {
      if (variables === null) {
        console.log('FCM Token successfully cleared from backend server.');
      } else {
        console.log('FCM Token securely synchronized with backend server.');
      }
    },
    onError: (err) => {
      console.error('Failed to sync/clear FCM Token:', err);
    }
  });
};