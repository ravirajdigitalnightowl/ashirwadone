
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerService } from '../services/workerService';
import { Alert } from 'react-native';

// 🔥 UPDATE: Removed page and limit parameters. Set default timeRange to 'This Month'
export const useWorkerTasks = (status: string = 'All', timeRange: string = 'This Month') => {
  return useQuery({
    // Query key se page aur limit hata diya
    queryKey: ['workerTasks', status, timeRange],
    queryFn: () => workerService.getTasks(status, timeRange),
  });
};

// Hook: Complete Task
export const useCompleteTask = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workerService.completeTask,
    onSuccess: () => {
      // Refresh worker tasks list immediately
      queryClient.invalidateQueries({ queryKey: ['workerTasks'] });
      Alert.alert('Success', 'Task marked as resolved! ✅');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
    },
  });
};

// Hook: Toggle Duty Status
export const useToggleDuty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workerService.toggleDuty,
    onSuccess: (data) => {
      // Optional: Agar profile caching use kar rahe ho toh yahan invalidate kar sakte ho
      Alert.alert('Duty Updated', data.message);
    },
  });
};