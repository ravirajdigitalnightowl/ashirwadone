

// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, DeviceEventEmitter } from 'react-native';
import { API_BASE_URL } from '@env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Connection Timeout', 'The server is taking too long to respond. Please check your internet connection.');
      } else {
        Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection or try again later.');
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔴 Session Expired / Unauthorized
    if (status === 401) {
      Alert.alert('Session Expired', 'Your session has expired. Please log in again to continue.');
      
      // Clear storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // 👉 TRANSMIT SIGNAL: Notify AuthContext to reset state
      DeviceEventEmitter.emit('FORCE_LOGOUT');
    } 
    else if (status === 429) {
      Alert.alert('Too Many Requests', 'You have made too many requests in a short period. Please wait a moment and try again.');
    } 
    else if (status >= 500) {
      Alert.alert('Server Error', 'An unexpected technical issue occurred on the server. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;