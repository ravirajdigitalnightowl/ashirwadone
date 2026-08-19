// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import api from '../services/api';

// 🔥 UPDATE: Added SUPER_ADMIN role
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'RESIDENT' | 'WORKER' | null;

// 🔥 NAYA: Society Branding Interface (Populated on login)
export interface SocietyData {
  _id: string;
  name: string;
  logoUrl?: string;
  bannerImages?: string[];
  promoVideoUrl?: string;
  aboutText?: string;
  amenities?: string[];
}

// 🔥 UPDATE: Added new SaaS fields (floor, shift, societyId, etc.)
export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  societyId?: SocietyData; // Populated from backend
  
  // Resident fields
  tower?: string;
  floor?: string; 
  flatNo?: string;
  
  // Worker fields
  department?: string;
  shiftStart?: string; 
  shiftEnd?: string;   
  aadharNo?: string;   
  photoUrl?: string; 
}

interface AuthContextProps {
  userRole: UserRole;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

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

          // Auto-login par token Firebase se fresh lo aur sync karo
          try {
            const authStatus = await messaging().requestPermission();
            if (
              authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
              authStatus === messaging.AuthorizationStatus.PROVISIONAL
            ) {
              const fcmToken = await messaging().getToken();
              if (fcmToken) {
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
        setIsLoading(false);
      }
    };

    bootstrapAsync();

    // 2. LISTEN FOR INTERCEPTOR LOGOUT SIGNAL
    const logoutListener = DeviceEventEmitter.addListener('FORCE_LOGOUT', async () => {
      console.log('Force logout triggered by interceptor');
      setUserData(null);
      setUserRole(null);
    });

    return () => {
      logoutListener.remove();
    };
  }, []);

  // 3. REAL LOGIN FUNCTION (CALLS BACKEND API)
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, data } = response.data;
      const user = data.user; // User object will now include populated societyId

      // AsyncStorage mein securely save karo
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Login hote hi Firebase se token lo aur Backend ko bhejo
      try {
        const authStatus = await messaging().requestPermission();
        if (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        ) {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
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
      throw error; 
    }
  };

  // 4. REAL LOGOUT FUNCTION
  const logout = async () => {
    try {
      // App se logout hone se PEHLE backend par token null kar do
      try {
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