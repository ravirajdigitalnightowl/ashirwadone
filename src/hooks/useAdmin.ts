// // src/hooks/useAdmin.ts
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Alert } from 'react-native';

// ==========================================
// TICKET HOOKS
// ==========================================

// 🔥 UPDATE: Upgraded to useInfiniteQuery & added month/year filters
export const useAllTickets = (status: string = 'All', timeRange: string = 'This Month', month?: string, year?: string) => {
  return useInfiniteQuery({
    queryKey: ['adminTickets', status, timeRange, month, year],
    queryFn: ({ pageParam = 1 }) => adminService.getAllTickets({ status, timeRange, month, year, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: Infinity,
  });
};

export const useTicketDetails = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticketDetails', ticketId],
    queryFn: () => adminService.getTicketDetails(ticketId),
    enabled: !!ticketId, // Tabhi fetch karega jab ticketId available ho
  });
};

export const useAssignTicket = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.assignTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['ticketDetails'] });
      Alert.alert('Success', 'Task assigned to staff! 🛠️');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Assignment failed');
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getDashboardStats,
    staleTime: Infinity,
  });
};

// ==========================================
// ATTENDANCE HOOK (🔥 NEW SAAS FEATURE)
// ==========================================

export const useAttendanceReport = (date?: string, month?: string, year?: string) => {
  return useInfiniteQuery({
    queryKey: ['adminAttendance', date, month, year],
    queryFn: ({ pageParam = 1 }) => adminService.getAttendanceReport({ date, month, year, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// ==========================================
// WORKER HOOKS
// ==========================================

export const useToggleWorkerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.toggleWorkerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWorkers'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update worker status');
    },
  });
};

export const useAddWorker = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.addWorker,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminWorkers'] });
      Alert.alert(
        'Worker Added Successfully', 
        `${variables.name} has been registered as a ${variables.department}.`
      );
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Failed to add worker');
    },
  });
};

// 🔥 UPDATE: Upgraded to useInfiniteQuery
export const useWorkers = (search: string = '', department: string = 'All') => {
  return useInfiniteQuery({
    queryKey: ['adminWorkers', search, department],
    queryFn: ({ pageParam = 1 }) => adminService.getAllWorkers({ search, department, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// ==========================================
// RESIDENT HOOKS
// ==========================================

// 🔥 UPDATE: Upgraded to useInfiniteQuery
export const useResidents = (search: string = '') => {
  return useInfiniteQuery({
    queryKey: ['adminResidents', search],
    queryFn: ({ pageParam = 1 }) => adminService.getAllResidents({ search, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useToggleResidentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminResidents'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update resident status');
    },
  });
};

// Add Resident Hook
export const useAddResident = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.addWorker, // Hum same /admin/users endpoint use kar rahe hain
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminResidents'] });
      Alert.alert('Success', 'Resident added successfully!');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add resident');
    },
  });
};

// Update User Hook (For Edit Screen)
export const useUpdateUser = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminResidents'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkers'] });
      Alert.alert('Success', 'Profile updated successfully!');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    },
  });
};

// ==========================================
// DEPARTMENT HOOKS
// ==========================================
export const useDepartments = () => {
  return useQuery({
    queryKey: ['adminDepartments'],
    queryFn: adminService.getAllDepartments,
  });
};

export const useCreateDepartment = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
    },
  });
};