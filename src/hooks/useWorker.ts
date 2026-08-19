// src/hooks/useWorker.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerService } from '../services/workerService';
import { Alert } from 'react-native';

// ==========================================
// WORKER TASKS HOOKS
// ==========================================

// 🔥 UPDATE: Upgraded to useInfiniteQuery & added month/year filters
export const useWorkerTasks = (status: string = 'All', timeRange: string = 'This Month', month?: string, year?: string) => {
  return useInfiniteQuery({
    queryKey: ['workerTasks', status, timeRange, month, year],
    queryFn: ({ pageParam = 1 }) => workerService.getTasks({ status, timeRange, month, year, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
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