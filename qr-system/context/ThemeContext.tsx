import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, ThemeColors, ThemeMode, themes } from '@/constants/colors';

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isSystemTheme: boolean;
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  const [theme, setThemeState] = useState<ThemeColors>(lightTheme);

  useEffect(() => {
    // Load theme mode from AsyncStorage on app start
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('app_theme_mode');
        const savedIsSystemTheme = await AsyncStorage.getItem('app_use_system_theme');
        
        if (savedIsSystemTheme === 'true') {
          setIsSystemTheme(true);
          const systemMode = deviceColorScheme === 'dark' ? 'dark' : 'light';
          setThemeModeState(systemMode);
          setThemeState(themes[systemMode]);
        } else if (savedThemeMode && (savedThemeMode === 'light' || savedThemeMode === 'dark')) {
          setIsSystemTheme(false);
          setThemeModeState(savedThemeMode as ThemeMode);
          setThemeState(themes[savedThemeMode as ThemeMode]);
        } else {
          // Default to system theme if no preference is saved
          setIsSystemTheme(true);
          const systemMode = deviceColorScheme === 'dark' ? 'dark' : 'light';
          setThemeModeState(systemMode);
          setThemeState(themes[systemMode]);
        }
      } catch (error) {
        console.log('Error loading theme mode from storage:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Update theme when device color scheme changes and system theme is enabled
  useEffect(() => {
    if (isSystemTheme) {
      const systemMode = deviceColorScheme === 'dark' ? 'dark' : 'light';
      setThemeModeState(systemMode);
      setThemeState(themes[systemMode]);
    }
  }, [deviceColorScheme, isSystemTheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setIsSystemTheme(false);
      setThemeModeState(mode);
      setThemeState(themes[mode]);
      await AsyncStorage.setItem('app_theme_mode', mode);
      await AsyncStorage.setItem('app_use_system_theme', 'false');
    } catch (error) {
      console.log('Error saving theme mode to storage:', error);
    }
  };

  const useSystemTheme = async () => {
    try {
      setIsSystemTheme(true);
      const systemMode = deviceColorScheme === 'dark' ? 'dark' : 'light';
      setThemeModeState(systemMode);
      setThemeState(themes[systemMode]);
      await AsyncStorage.setItem('app_use_system_theme', 'true');
    } catch (error) {
      console.log('Error setting system theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode, isSystemTheme, useSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};