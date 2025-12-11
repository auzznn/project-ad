import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';
import { authApi } from './authApi';

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for all API requests
    // console.log('DEBUG: API request details:', {
    //   url: (config.baseURL || '') + (config.url || ''),
    //   method: config.method,
    //   hasToken: !!token,
    //   headers: config.headers,
    //   data: config.data
    // });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  async (error) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    
    // Debug logging for all API errors
    // console.log('DEBUG: API error details:', {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   data: error.response?.data,
    //   config: {
    //     url: error.config?.url,
    //     method: error.config?.method,
    //     data: error.config?.data
    //   }
    // });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
      if (error.response.status === 401) {
        // Unauthorized - token might be expired
        console.log('Unauthorized access - attempting to refresh token');
        
        try {
          // Get the refresh token
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          
          if (refreshToken) {
            // Attempt to refresh the token
            const response = await authApi.refreshToken(refreshToken);
            const newAccessToken = response.access;
            
            // Store the new access token
            await AsyncStorage.setItem('access_token', newAccessToken);
            await AsyncStorage.setItem('authToken', newAccessToken);
            
            // Update the original request with the new token
            if (error.config && error.config.headers) {
              error.config.headers.Authorization = `Bearer ${newAccessToken}`;
              
              // Retry the original request
              return apiClient(error.config);
            }
          } else {
            // No refresh token available, clear all tokens
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
            console.log('No refresh token available, clearing all tokens');
          }
        } catch (refreshError) {
          // Refresh failed, clear all tokens
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user_data');
          console.log('Token refresh failed, clearing all tokens:', refreshError);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Network error - no response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic request methods
export const apiRequest = {
  get: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then(response => response.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(response => response.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(response => response.data);
  },
  
  patch: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => response.data);
  },
  
  delete: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(response => response.data);
  },
};

export default apiClient;