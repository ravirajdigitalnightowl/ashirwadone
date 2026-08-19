
// src/navigation/WorkerTabNavigator.tsx
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Context & Theme
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext'; // 🔥 AuthContext import kiya

// Worker Screens
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import WorkerHistoryScreen from '../screens/worker/WorkerHistoryScreen';
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen';

// Security Screens
import SecurityDashboardScreen from '../screens/security/SecurityDashboardScreen';

const Tab = createBottomTabNavigator();

const WorkerTabNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { userData } = useContext(AuthContext);

  // 🔥 CHECK: Kya login karne wala worker Security Guard hai?
  const isSecurity = userData?.department === 'Security';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'TasksTab' || route.name === 'GateTab') {
            // Guard ke liye Gate icon, baakiyon ke liye clipboard
            iconName = isSecurity ? (focused ? 'boom-gate' : 'boom-gate-outline') : (focused ? 'clipboard-list' : 'clipboard-list-outline');
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'history' : 'clock-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = 'account-hard-hat'; 
          }

          return <MaterialCommunityIcons name={iconName} size={size + 2} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          elevation: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 }
      })}
    >
      {/* 🔥 CONDITIONAL RENDERING: Security hai toh GateTab, nahi toh TasksTab */}
      {isSecurity ? (
        <Tab.Screen name="GateTab" component={SecurityDashboardScreen} options={{ title: 'Gate Live' }} />
      ) : (
        <Tab.Screen name="TasksTab" component={WorkerDashboardScreen} options={{ title: 'My Tasks' }} />
      )}
      
      {/* Guard ko filhal History tab ki zaroorat nahi hai */}
      {!isSecurity && (
        <Tab.Screen name="HistoryTab" component={WorkerHistoryScreen} options={{ title: 'History' }} />
      )}
      
      <Tab.Screen name="ProfileTab" component={WorkerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default WorkerTabNavigator;