
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentService } from '../services/residentService';
import { Alert } from 'react-native';

// 🔥 UPDATE: Removed page and limit parameters. Set default timeRange to 'This Month'
export const useMyTickets = (status: string = 'All', timeRange: string = 'This Month') => {
  return useQuery({
    // Query key se page aur limit hata diya
    queryKey: ['residentTickets', status, timeRange],
    queryFn: () => residentService.getMyTickets(status, timeRange),
  });
};

// Hook: Create Ticket (With Auto-Refresh)
export const useCreateTicket = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: residentService.createTicket,
    onSuccess: () => {
      // Jadoo: Naya ticket bante hi Resident list ko background mein refresh kar do
      queryClient.invalidateQueries({ queryKey: ['residentTickets'] });
      Alert.alert('Success', 'Complaint registered successfully! 🚨');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create ticket');
    },
  });
};

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