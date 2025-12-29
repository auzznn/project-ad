import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";

export interface User {
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
  user_id: string;
  // Add other user properties as needed
}

interface DecodedToken {
  username: string;
  role: string;
  first_name: string;
  last_name: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
  url: {
    refresh: string;
  };
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user_data");
        const storedToken = await AsyncStorage.getItem("access_token");

        console.log("AuthContext - Starting auth check...");

        // Only restore user session if both user data and token exist
        if (storedUser && storedToken) {
          // Log for debugging
          console.log("Found stored user data:", JSON.parse(storedUser));
          console.log("Found stored token, checking validity...");
          
          // Decode token to check if it's still valid
          try {
            const decodedToken = jwtDecode<DecodedToken>(storedToken);
            const currentTime = Date.now() / 1000;
            
            console.log("Token expiration:", decodedToken.exp);
            console.log("Current time:", currentTime);
            
            if (decodedToken.exp > currentTime) {
              console.log("Token is valid, restoring user session");
              // Update user data with info from token
              const userData = JSON.parse(storedUser);
              const updatedUserData: User = {
                ...userData,
                first_name: decodedToken.first_name,
                last_name: decodedToken.last_name,
                role: decodedToken.role,
                user_id: decodedToken.user_id.toString()
              };
              setUser(updatedUserData);
              setIsAuthenticated(true);
              console.log("AuthContext - User session restored, isAuthenticated set to true");
            } else {
              console.log("Token has expired, clearing session");
              await AsyncStorage.removeItem("user_data");
              await AsyncStorage.removeItem("access_token");
              await AsyncStorage.removeItem("refresh_token");
              await AsyncStorage.removeItem("authToken");
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (decodeError) {
            console.log("Error decoding token:", decodeError);
            // Clear invalid token
            await AsyncStorage.removeItem("user_data");
            await AsyncStorage.removeItem("access_token");
            await AsyncStorage.removeItem("refresh_token");
            await AsyncStorage.removeItem("authToken");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("No stored user data or token found");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Error checking auth status:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log("AuthContext - Setting isLoading to false");
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

      // Decode the JWT token to extract user information
      try {
        console.log("Decoding JWT token...");
        const decodedToken = jwtDecode<DecodedToken>(response.access);
        console.log("Decoded token data:", decodedToken);

        // Create user object with data from decoded token
        const userData: User = {
          username: decodedToken.username,
          role: decodedToken.role,
          first_name: decodedToken.first_name,
          last_name: decodedToken.last_name,
          user_id: decodedToken.user_id.toString()
        };

        console.log("Created user data:", userData);

        // Save user + tokens
        await AsyncStorage.setItem("user_data", JSON.stringify(userData));
        await AsyncStorage.setItem("access_token", response.access);
        await AsyncStorage.setItem("refresh_token", response.refresh);
        // Also save as authToken for axiosClient interceptor
        await AsyncStorage.setItem("authToken", response.access);

        setUser(userData);
        setIsAuthenticated(true);
        console.log("AuthContext - Login successful, isAuthenticated set to true");
        return true;
      } catch (decodeError) {
        console.log("Error decoding token after login:", decodeError);
        setIsAuthenticated(false);
        return false;
      }
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
      setIsAuthenticated(false);
      console.log("AuthContext - Logout successful, isAuthenticated set to false");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };


  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  // Debug logging for authentication state
  console.log("AuthContext - Rendering with state:", { user, isLoading, isAuthenticated });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

