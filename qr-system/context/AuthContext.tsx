import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";

interface User {
  username: string;
  role: string
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user_data");
        const storedToken = await AsyncStorage.getItem("access_token");

        // Only restore user session if both user data and token exist
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Make API request

      const response = await authApi.login({ username, password });

      // Example API response:
      // { access: "...", refresh: "...", user: { username: "...", role: "..." } }
      // For now, we'll assume the API returns just tokens
      const userData: User = {
        username,
        role: "guardian" // This should be determined from API response when available
      };

      // Save user + tokens
      await AsyncStorage.setItem("user_data", JSON.stringify(userData));
      await AsyncStorage.setItem("access_token", response.access);
      await AsyncStorage.setItem("refresh_token", response.refresh);
      // Also save as authToken for axiosClient interceptor
      await AsyncStorage.setItem("authToken", response.access);

      setUser(userData);
      return true;
    } catch (error) {
      console.log("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("user_data");
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("authToken");
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
