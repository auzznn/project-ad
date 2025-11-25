import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

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
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
      if (error.response.status === 401) {
        // Unauthorized - token might be expired
        // Clear the token and redirect to login
        await AsyncStorage.removeItem('authToken');
        
        // You might want to navigate to login screen here
        // This would require using navigation or a global state management
        console.log('Unauthorized access - token might be expired');
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