// src/hooks/useResident.ts
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentService } from '../services/residentService';
import { Alert } from 'react-native';

// ==========================================
// TICKET HOOKS
// ==========================================

// 🔥 UPDATE: Upgraded to useInfiniteQuery & added month/year filters
export const useMyTickets = (status: string = 'All', timeRange: string = 'This Month', month?: string, year?: string) => {
  return useInfiniteQuery({
    queryKey: ['residentTickets', status, timeRange, month, year],
    queryFn: ({ pageParam = 1 }) => residentService.getMyTickets({ status, timeRange, month, year, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Hook: Create Ticket (With Auto-Refresh)
export const useCreateTicket = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residentService.createTicket,
    onSuccess: () => {
      // Naya ticket bante hi Resident list ko background mein refresh kar do
      queryClient.invalidateQueries({ queryKey: ['residentTickets'] });
      Alert.alert('Success', 'Complaint registered successfully! 🚨');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create ticket');
    },
  });
};

// ==========================================
// POSTS / NOTICE BOARD HOOK (🔥 NEW SAAS FEATURE)
// ==========================================

export const useAllPosts = (type: string = 'All', month?: string, year?: string) => {
  return useInfiniteQuery({
    queryKey: ['residentPosts', type, month, year],
    queryFn: ({ pageParam = 1 }) => residentService.getAllPosts({ type, month, year, pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// ==========================================
// PROFILE & CATEGORIES
// ==========================================

// Hook: Update Profile
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: residentService.updateProfile,
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully! ✅');
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['residentCategories'],
    queryFn: residentService.getCategories,
  });
};