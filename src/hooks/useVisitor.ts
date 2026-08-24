
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitorService } from '../services/visitorService';
import { Alert } from 'react-native';

// 🔥 UPDATE: Removed page and limit for pagination
export const useActiveVisitors = (timeRange: string = 'Today') => {
  return useQuery({
    // queryKey se page aur limit hata diya
    queryKey: ['activeVisitors', timeRange], 
    queryFn: () => visitorService.getActiveVisitors(timeRange),
    // Har 10 second mein auto-refresh taaki resident ka approval turant dikh jaye
  });
};

// Hook: Guard Requests Entry
export const useRequestEntry = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: visitorService.requestEntry,
    onSuccess: (data) => {
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      
      // Agar resident app par nahi hai, toh guard ko manual call karne ka alert aayega
      if (!data.data.hasResidentApp) {
        Alert.alert('Manual Verification Needed', `Resident is not registered on the app. Please call them on: ${data.data.residentPhone || 'No number available'}`);
      } else {
        Alert.alert('Request Sent', 'Approval request sent to the resident successfully. Waiting for response...');
      }

      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to request entry');
    },
  });
};

// Hook: Guard Marks Exit
export const useMarkExit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: visitorService.markExit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark exit');
    },
  });
};

// Hook: Resident Responds (Approve/Deny)
export const useRespondToEntry = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: visitorService.respondToEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit response');
    },
  });
};

// Hook: Resident Invites Guest
export const useInviteVisitor = (onSuccessCallback?: (data: any) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorService.inviteVisitor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      if (onSuccessCallback) onSuccessCallback(data);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate invite');
    },
  });
};

// Hook: Guard Verifies Passcode
export const useVerifyPasscode = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorService.verifyPasscode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      Alert.alert('Success ✅', 'Passcode verified. Entry Allowed!');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      Alert.alert('Verification Failed ❌', error.response?.data?.message || 'Invalid passcode');
    },
  });
};

// Hook: Get Resident's Visitors
// 🔥 UPDATE: Removed page and limit for pagination
export const useMyVisitors = (timeRange: string = 'Today') => {
  return useQuery({
    queryKey: ['myVisitors', timeRange],
    queryFn: () => visitorService.getMyVisitors(timeRange), 
  });
};