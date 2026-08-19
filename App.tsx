
import 'react-native-gesture-handler'; // Ye hamesha sabse top par hona chahiye
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- REACT QUERY IMPORTS ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- CONTEXT PROVIDERS ---
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

// --- MAIN NAVIGATION CONTROLLER ---
import RootNavigator from './src/navigation/RootNavigator';

// QueryClient ka instance hamesha component ke bahar banana chahiye
const queryClient = new QueryClient();

const App = () => {
  return (
    <SafeAreaProvider>
      {/* QueryClientProvider sabse outer wrapper hona chahiye (safe area ke baad) */}
      <QueryClientProvider client={queryClient}>
        
        {/* ThemeProvider aur AuthProvider ko wrap kiya gaya hai */}
        <ThemeProvider>
          <AuthProvider>
            
            {/* Default StatusBar styling */}
            <StatusBar 
              translucent 
              backgroundColor="transparent" 
              barStyle="dark-content" 
            />
            
            {/* Saara navigation logic yahan handle hoga */}
            <RootNavigator />
            
          </AuthProvider>
        </ThemeProvider>

      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;