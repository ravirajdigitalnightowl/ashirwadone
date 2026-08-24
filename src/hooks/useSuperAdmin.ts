import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminService } from '../services/superAdminService';
import { Alert } from 'react-native';

export const useGetSocieties = (search: string = '') => {
  return useInfiniteQuery({
    queryKey: ['superAdminSocieties', search],
    queryFn: ({ pageParam = 1 }) => superAdminService.getAllSocieties({ pageParam, limit: 10, search }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useCreateSociety = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminService.createSocietyAndAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminSocieties'] });
      Alert.alert('Success', 'Society and Admin created successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => Alert.alert('Error', err.response?.data?.message || 'Failed to create society')
  });
};

export const useToggleSocietyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminService.toggleSocietyStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['superAdminSocieties'] })
  });
};