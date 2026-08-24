// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import messaging from '@react-native-firebase/messaging'; // 🔥 NAYA IMPORT
import api from '../services/api'; // Humara banaya hua Axios instance

// Teeno roles define kiye
export type UserRole = 'ADMIN' | 'RESIDENT' | 'WORKER' | null;

// User Data ki backend wali structure
export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  tower?: string;
  flatNo?: string;
  department?: string;
}

// Context ke props
interface AuthContextProps {
  userRole: UserRole;
  userData: UserData | null;
  isLoading: boolean; // App khulte time loader dikhane ke liye
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Default Values
export const AuthContext = createContext<AuthContextProps>({
  userRole: null,
  userData: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. APP MOUNT HOTE HI STORAGE CHECK KAREGA (AUTO-LOGIN)
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');

        if (token && storedUserData) {
          const parsedUser: UserData = JSON.parse(storedUserData);
          setUserData(parsedUser);
          setUserRole(parsedUser.role);

          // 🔥 NAYA: Auto-login par token Firebase se fresh lo aur sync karo
          try {
            const authStatus = await messaging().requestPermission();
            if (
              authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
              authStatus === messaging.AuthorizationStatus.PROVISIONAL
            ) {
              const fcmToken = await messaging().getToken();
              if (fcmToken) {
                // api instance ka use kar rahe hain kyunki interceptor header me token laga dega
                // 🔥 UPDATE: '/auth/update-fcm' route kar diya
                await api.patch('/auth/update-fcm', { fcmToken });
              }
            }
          } catch (err) {
            console.log("FCM sync error on auto-login", err);
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false); // Checking khatam, ab app render hone do
      }
    };

    bootstrapAsync();

    // 2. LISTEN FOR INTERCEPTOR LOGOUT SIGNAL
    const logoutListener = DeviceEventEmitter.addListener('FORCE_LOGOUT', async () => {
      console.log('Force logout triggered by interceptor');
      // Token api.ts mein clear ho chuka hai, bas state null karni hai
      setUserData(null);
      setUserRole(null);
    });

    return () => {
      // Cleanup listener jab component unmount ho
      logoutListener.remove();
    };
  }, []);

  // 3. REAL LOGIN FUNCTION (CALLS BACKEND API)
  const login = async (email: string, password: string) => {
    try {
      // Backend ko request bhejo
      const response = await api.post('/auth/login', { email, password });
      
      const { token, data } = response.data;
      const user = data.user;

      // AsyncStorage mein securely save karo
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // 🔥 NAYA: Login hote hi Firebase se token lo aur Backend ko bhejo
      try {
        const authStatus = await messaging().requestPermission();
        if (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        ) {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            // 🔥 UPDATE: '/auth/update-fcm' route kar diya
            await api.patch('/auth/update-fcm', { fcmToken });
          }
        }
      } catch (fcmError) {
        console.error('Failed to sync FCM Token on login:', fcmError);
      }

      // State update karo jisse React Navigation khud screen change kar dega
      setUserData(user);
      setUserRole(user.role);
    } catch (error: any) {
      // Agar invalid email/password hoga toh humein frontend ke login form par catch karna padega
      throw error; 
    }
  };

  // 4. REAL LOGOUT FUNCTION
  const logout = async () => {
    try {
      // 🔥 NAYA: App se logout hone se PEHLE backend par token null kar do
      try {
        // 🔥 UPDATE: '/auth/update-fcm' route kar diya
        await api.patch('/auth/update-fcm', { fcmToken: null });
      } catch (fcmError) {
        console.error('Failed to clear FCM Token on backend:', fcmError);
      }

      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserData(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ userRole, userData, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};