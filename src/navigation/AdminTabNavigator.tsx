
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Context & Theme
import { ThemeContext } from '../context/ThemeContext';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'; // 🔥 NAYA DASHBOARD IMPORT
import AdminComplaintsScreen from '../screens/admin/AdminComplaintsScreen'; // Purana Dashboard
import ManageResidentsScreen from '../screens/admin/ManageResidentsScreen'; 
import ManageStaffScreen from '../screens/admin/ManageStaffScreen';         
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          // 🔥 UPDATE: 5 Tabs ke liye icons set kiye hain
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'ComplaintsTab') {
            iconName = focused ? 'clipboard-text' : 'clipboard-text-outline';
          } else if (route.name === 'ResidentsTab') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'StaffTab') {
            iconName = focused ? 'account-hard-hat' : 'account-hard-hat'; 
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'shield-account' : 'shield-account-outline';
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
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11, // 5 tabs adjust karne ke liye font thoda sa chhota kiya hai
          fontWeight: '600',
          marginTop: 2,
        }
      })}
    >
      <Tab.Screen name="DashboardTab" component={AdminDashboardScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="ComplaintsTab" component={AdminComplaintsScreen} options={{ title: 'Complaints' }} />
      <Tab.Screen name="ResidentsTab" component={ManageResidentsScreen} options={{ title: 'Residents' }} />
      <Tab.Screen name="StaffTab" component={ManageStaffScreen} options={{ title: 'Staff' }} />
      <Tab.Screen name="ProfileTab" component={AdminProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;