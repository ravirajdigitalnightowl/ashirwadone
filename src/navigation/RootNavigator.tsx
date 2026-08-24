
import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, AppState, DeviceEventEmitter, Alert, Platform, PermissionsAndroid } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import messaging from '@react-native-firebase/messaging'; 
import notifee, { EventType } from '@notifee/react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { navigationRef } from './navigationRef'; 

// 🔥 NAYE IMPORTS (Event-Driven Push-to-Sync ke liye React Query)
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

// --- STACKS & SCREENS IMPORTS ---
import AuthStack from './AuthStack';
import AdminTabNavigator from './AdminTabNavigator'; 
import ResidentTabNavigator from './ResidentTabNavigator'; 
import WorkerTabNavigator from './WorkerTabNavigator'; 
import TicketDetailsScreen from '../screens/admin/TicketDetailsScreen';
import SettingsScreenAdmin from '../screens/admin/SettingsScreen';
import AddWorkerScreen from '../screens/admin/AddWorkerScreen';
import EditWorkerScreen from '../screens/admin/EditWorkerScreen';
import AddResidentScreen from '../screens/admin/AddResidentScreen';
import EditResidentScreen from '../screens/admin/EditResidentScreen';
import ManageDepartmentsScreen from '../screens/admin/ManageDepartmentsScreen';
// 🔥 NAYA IMPORT: Admin Visitors Screen
import AdminVisitorsScreen from '../screens/admin/AdminVisitorsScreen';

import CreateComplaintScreen from '../screens/resident/CreateComplaintScreen';
import ComplaintDetailScreen from '../screens/resident/ComplaintDetailScreen';
import SettingsScreenResident from '../screens/resident/SettingsScreen';
import GateApprovalScreen from '../screens/resident/GateApprovalScreen'; 
import InviteGuestScreen from '../screens/resident/InviteGuestScreen'; 

import WorkerTaskDetailsScreen from '../screens/worker/WorkerTaskDetailsScreen';
import WorkerSettingsScreen from '../screens/worker/WorkerSettingsScreen';
import AddVisitorScreen from '../screens/security/AddVisitorScreen'; 
import NotificationTroubleshootScreen from '../screens/common/NotificationTroubleshootScreen';

const Stack = createStackNavigator<any>();

let pendingNotificationData: any = null;

// 🔥 NAYA: Global timer map for per-query smart debounce
const debounceTimers = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_DELAY = 10000; // 10 Seconds ka delay

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <Stack.Screen name="MainTabs" component={AdminTabNavigator} options={{ gestureEnabled: false }} />
    <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, gestureDirection: 'vertical' }} />
    <Stack.Screen name="Settings" component={SettingsScreenAdmin} />
    <Stack.Screen name="AddWorkerScreen" component={AddWorkerScreen} />
    <Stack.Screen name="EditWorkerScreen" component={EditWorkerScreen} />
    <Stack.Screen name="ManageDepartmentsScreen" component={ManageDepartmentsScreen} />
    <Stack.Screen name="AddResidentScreen" component={AddResidentScreen} />
    <Stack.Screen name="EditResidentScreen" component={EditResidentScreen} />
    {/* 🔥 NAYA SCREEN ADDED */}
    <Stack.Screen name="AdminVisitorsScreen" component={AdminVisitorsScreen} />
  </Stack.Navigator>
);

const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <Stack.Screen name="MainTabs" component={ResidentTabNavigator} options={{ gestureEnabled: false }} />
    <Stack.Screen name="CreateComplaint" component={CreateComplaintScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, gestureDirection: 'vertical' }} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
    <Stack.Screen name="Settings" component={SettingsScreenResident} />
    <Stack.Screen name="GateApprovalScreen" component={GateApprovalScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, gestureDirection: 'vertical' }} />
    <Stack.Screen name="InviteGuestScreen" component={InviteGuestScreen} />
    <Stack.Screen name="NotificationTroubleshootScreen" component={NotificationTroubleshootScreen} />
  </Stack.Navigator>
);

const WorkerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <Stack.Screen name="WorkerTabs" component={WorkerTabNavigator} options={{ gestureEnabled: false }} />
    <Stack.Screen name="WorkerTaskDetails" component={WorkerTaskDetailsScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, gestureDirection: 'vertical' }} />
    <Stack.Screen name="WorkerSettings" component={WorkerSettingsScreen} />
    <Stack.Screen name="AddVisitorScreen" component={AddVisitorScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { userRole, isLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔥 1. Query Client Initialise kiya
  const queryClient = useQueryClient();

  // 🔥 2. SMART DEBOUNCE LOGIC
  const triggerDebouncedSync = useCallback((queryKeyArray: string[]) => {
    const keyString = JSON.stringify(queryKeyArray);

    if (debounceTimers.has(keyString)) {
      clearTimeout(debounceTimers.get(keyString)!);
    }

    const timeout = setTimeout(() => {
      console.log(`🔄 [Push-to-Sync] Updating data for: ${keyString}`);
      queryClient.invalidateQueries({ queryKey: queryKeyArray });
      debounceTimers.delete(keyString);
    }, DEBOUNCE_DELAY);

    debounceTimers.set(keyString, timeout);
  }, [queryClient]);

  // 🔥 3. EVENT HANDLER: Type ke hisaab se specific queries invalidate hongi
  const handleSilentEvent = useCallback((type: string) => {
    console.log('📩 Push-to-Sync Event Received:', type);
    switch (type) {
      case 'DASHBOARD_UPDATE': 
      case 'WORKER_DUTY_CHANGED':
        triggerDebouncedSync(['adminStats']);
        triggerDebouncedSync(['adminWorkers']);
        break;
      case 'NEW_COMPLAINT':
      case 'TICKET_UPDATED':
        triggerDebouncedSync(['adminTickets']);
        triggerDebouncedSync(['adminStats']);
        triggerDebouncedSync(['residentTickets']);
        triggerDebouncedSync(['ticketDetails']);
        break;
      case 'TASK_ASSIGNED':
        triggerDebouncedSync(['workerTasks']);
        break;
      case 'GATE_UPDATE':
      case 'NEW_VISITOR':
      case 'VISITOR_EXIT':
        triggerDebouncedSync(['activeVisitors']);
        triggerDebouncedSync(['myVisitors']);
        triggerDebouncedSync(['adminStats']); 
        DeviceEventEmitter.emit('REFRESH_VISITORS'); 
        break;
      default:
        break;
    }
  }, [triggerDebouncedSync]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const requestAllPermissions = async () => {
      if (Platform.OS !== 'android') return;

      if (Platform.Version >= 33) {
        try {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } catch (err) {
          console.warn('Error requesting notification permission', err);
        }
      }

      if (Platform.Version >= 34 && userRole === 'RESIDENT') {
        const hasFullScreenPermission = await notifee.hasFullScreenIntent();
        
        if (!hasFullScreenPermission) {
          Alert.alert(
            'Enable Gate Alerts 🚨',
            'To receive gate approval popups directly on your lock screen, please allow "Full Screen Intents" in settings.',
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: async () => {
                  await notifee.openFullScreenIntentSettings();
                }
              }
            ]
          );
        }
      }
    };

    if (userRole) {
      requestAllPermissions(); 
    }

    const handleUniversalNavigation = (data: any) => {
      if (!data || !data.type) return;

      // 🔥 Tap karte hi background mein data sync trigger karo
      handleSilentEvent(data.type);

      if (navigationRef.isReady()) {
        switch (data.type) {
          case 'GATE_APPROVAL':
            navigationRef.navigate('GateApprovalScreen', {
              visitorId: data.visitorId,
              visitorName: data.visitorName,
              visitorType: data.visitorType,
              vehicleNo: data.vehicleNo,
              photoUrl: data.photoUrl
            });
            break;

          case 'NEW_COMPLAINT':
            if (userRole === 'ADMIN') {
              navigationRef.navigate('TicketDetails', { ticketId: data.ticketId });
            }
            break;

          case 'TASK_ASSIGNED':
            if (userRole === 'WORKER') {
              navigationRef.navigate('WorkerTaskDetails', { ticketId: data.ticketId });
            }
            break;

          case 'TICKET_UPDATED':
            if (userRole === 'RESIDENT') {
              navigationRef.navigate('ComplaintDetail', { ticketId: data.ticketId });
            } else if (userRole === 'ADMIN') {
              navigationRef.navigate('TicketDetails', { ticketId: data.ticketId });
            }
            break;
            
          default:
            console.log("Unhandled notification type", data.type);
        }
      } else {
        console.log('Navigation not ready yet, saving pending data...');
        pendingNotificationData = data;
      }
    };

    const checkPendingNavigation = async () => {
      try {
        const dataString = await AsyncStorage.getItem('pending_notification_data');
        if (dataString) {
          const parsedData = JSON.parse(dataString);
          handleUniversalNavigation(parsedData);
          await AsyncStorage.removeItem('pending_notification_data'); 
        }
      } catch (error) {
        console.log("Storage read error:", error);
      }
    };

    checkPendingNavigation();

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') checkPendingNavigation();
    });

    const checkKilledState = async () => {
      const fcmMessage = await messaging().getInitialNotification();
      if (fcmMessage) handleUniversalNavigation(fcmMessage.data);

      const notifeeMessage = await notifee.getInitialNotification();
      if (notifeeMessage && notifeeMessage.notification) {
        handleUniversalNavigation(notifeeMessage.notification.data);
      }
    };
    checkKilledState();

    const unsubscribeFCMOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      handleUniversalNavigation(remoteMessage.data);
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        handleUniversalNavigation(detail.notification.data);
      }
    });

    // 🔥 LOCAL EVENT LISTENER (Guard/Resident flow ya internal events ke liye)
    const localEventSubscription = DeviceEventEmitter.addListener('APP_SILENT_SYNC', (data) => {
      if (data?.type) handleSilentEvent(data.type);
    });

    // 🔥 FOREGROUND LISTENER UPDATE (Silent & Alert Notifications)
    const unsubscribeFCMForeground = messaging().onMessage(async remoteMessage => {
      const type = remoteMessage.data?.type as string;

      // GATE FLOW: Alert aayega aur data bhi turant sync hoga
      if (type === 'GATE_UPDATE') {
        Alert.alert(
          remoteMessage.notification?.title || "Gate Update",
          remoteMessage.notification?.body || "A visitor's status was updated by resident."
        );
        handleSilentEvent(type);
        return; 
      } 
      
      // ADMIN/WORKER Tickets & Silent Push (Foreground Update)
      const silentEventTypes = [
        'NEW_COMPLAINT', 'TASK_ASSIGNED', 'TICKET_UPDATED', 
        'DASHBOARD_UPDATE', 'WORKER_DUTY_CHANGED', 'VISITOR_EXIT', 'NEW_VISITOR'
      ];
      
      if (type && silentEventTypes.includes(type)) {
        handleSilentEvent(type);
        return;
      }

      // Default fallback
      handleUniversalNavigation(remoteMessage.data);
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeFCMOpened();
      unsubscribeNotifee();
      unsubscribeFCMForeground();
      localEventSubscription.remove();
      // Cleanup global timers on unmount
      debounceTimers.forEach(timer => clearTimeout(timer));
      debounceTimers.clear();
    };
  }, [userRole, handleSilentEvent]); 

  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
        <Animated.View style={{ alignItems: 'center', opacity: fadeAnim }}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight, shadowColor: theme.primary }]}>
            <MaterialCommunityIcons name="city-variant-outline" size={80} color={theme.primary} />
          </View>
          <Text style={[styles.splashTitle, { color: theme.textMain }]}>Ashirwad Society</Text>
          <Text style={[styles.splashSubtitle, { color: theme.textMuted }]}>Loading your digital community...</Text>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => {
        if (pendingNotificationData) {
          setTimeout(() => {
            const data = pendingNotificationData;
            pendingNotificationData = null; 
            
            if (!data.type) return;

            switch (data.type) {
              case 'GATE_APPROVAL':
                navigationRef.navigate('GateApprovalScreen', {
                  visitorId: data.visitorId, visitorName: data.visitorName,
                  visitorType: data.visitorType, vehicleNo: data.vehicleNo, photoUrl: data.photoUrl
                });
                break;
              case 'NEW_COMPLAINT':
                if (userRole === 'ADMIN') navigationRef.navigate('TicketDetails', { ticketId: data.ticketId });
                break;
              case 'TASK_ASSIGNED':
                if (userRole === 'WORKER') navigationRef.navigate('WorkerTaskDetails', { ticketId: data.ticketId });
                break;
              case 'TICKET_UPDATED':
                if (userRole === 'RESIDENT') navigationRef.navigate('ComplaintDetail', { ticketId: data.ticketId });
                else if (userRole === 'ADMIN') navigationRef.navigate('TicketDetails', { ticketId: data.ticketId });
                break;
            }
          }, 300);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === null ? (
          <Stack.Screen name="AuthFlow" component={AuthStack} />
        ) : userRole === 'ADMIN' ? (
          <Stack.Screen name="AdminFlow" component={AdminStack} />
        ) : userRole === 'WORKER' ? (
          <Stack.Screen name="WorkerFlow" component={WorkerStack} />
        ) : (
          <Stack.Screen name="ResidentFlow" component={ResidentStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    elevation: 10, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  splashTitle: { fontSize: 32, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
  splashSubtitle: { fontSize: 16, textAlign: 'center' }
});

export default RootNavigator;