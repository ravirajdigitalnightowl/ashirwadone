import React, { createContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ThemeColors } from '../theme/colors';

// Context ka type define kiya
interface ThemeContextProps {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Default value ke sath context create kiya
export const ThemeContext = createContext<ThemeContextProps>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

// Provider ke props ka type
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemTheme === 'dark');

  const theme: ThemeColors = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};