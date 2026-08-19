import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// --- COMMON AUTH SCREENS IMPORTS ---
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          // Register aur Forgot Password ke liye bottom se slide up effect
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid 
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ 
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid 
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;