
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Context & Theme
import { ThemeContext } from '../context/ThemeContext';

// Resident Screens
import HomeScreen from '../screens/resident/HomeScreen';
import ProfileScreen from '../screens/resident/ProfileScreen';
// 🔥 NAYA IMPORT: Visitors screen add kiya
import MyVisitorsScreen from '../screens/resident/MyVisitorsScreen';

const Tab = createBottomTabNavigator();

const ResidentTabNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'VisitorsTab') { // 🔥 NAYA ICON LOGIC
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
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
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        }
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      
      {/* 🔥 NAYA TAB: Visitors ke liye */}
      <Tab.Screen 
        name="VisitorsTab" 
        component={MyVisitorsScreen} 
        options={{ title: 'Visitors' }} 
      />

      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default ResidentTabNavigator;