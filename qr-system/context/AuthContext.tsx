import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  role: 'teacher' | 'guardian';
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  teacher: { username: 'admin', password: 'admin123' },
  guardian: { username: 'user', password: 'user123' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate brief loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check against hardcoded credentials
      if (username === ADMIN_CREDENTIALS.teacher.username && password === ADMIN_CREDENTIALS.teacher.password) {
        const userData: User = { username, role: 'teacher' };
        
        // Store user session
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      
      if (username === ADMIN_CREDENTIALS.guardian.username && password === ADMIN_CREDENTIALS.guardian.password) {
        const userData: User = { username, role: 'guardian' };
        
        // Store user session
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user_data');
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};