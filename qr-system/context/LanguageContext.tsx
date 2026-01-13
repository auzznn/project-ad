import React, { createContext, ReactNode, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setLanguageState(savedLanguage);
        i18n.locale = savedLanguage;
      } else {
        i18n.locale = 'en';
      }
    } catch (error) {
      console.error('Error loading language:', error);
      i18n.locale = 'en';
    }
  };

  const setLanguage = async (newLanguage: string) => {
    try {
      await AsyncStorage.setItem('appLanguage', newLanguage);
      setLanguageState(newLanguage);
      i18n.locale = newLanguage;
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
