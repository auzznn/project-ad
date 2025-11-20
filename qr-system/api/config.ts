import { Platform } from 'react-native';

// Get the correct IP address for your development machine
// For Android emulator, use 10.0.2.2 (special alias to your host loopback interface)
// For iOS simulator, use localhost or 127.0.0.1
// For physical devices, use your machine's IP address on the same network

// const getBaseUrl = () => {
//   if (__DEV__) {
//     if (Platform.OS === 'android') {
//       // For Android emulator
//       return 'http://10.0.2.2:8000/api';
//     } else if (Platform.OS === 'ios') {
//       // For iOS simulator
//       return 'http://localhost:8000/api';
//     } else {
//       // For web or other platforms
//       return 'http://localhost:8000/api';
//     }
//   } else {
//     // Production URL - replace with your actual production API URL
//     return 'https://your-production-api.com/api';
//   }
// };

const baseURL = 'http://192.168.0.24:8080/api/';

export const API_CONFIG = {
  BASE_URL: baseURL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// For physical devices, you'll need to use your machine's IP address
// You can get this by running `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
// and then updating the BASE_URL accordingly:
// export const API_CONFIG = {
//   BASE_URL: 'http://192.168.1.100:8000/api', // Replace with your actual IP
//   TIMEOUT: 10000,
//   HEADERS: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
// };