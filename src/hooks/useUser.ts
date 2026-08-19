import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/userService';

// Hook: Save Device Token to DB
export const useUpdateFcmToken = () => {
  return useMutation({
    mutationFn: userService.updateFcmToken,
    onSuccess: () => {
      console.log('FCM Token securely synchronized with backend server.');
    },
    onError: (err) => {
      console.error('Failed to sync FCM Token:', err);
    }
  });
};