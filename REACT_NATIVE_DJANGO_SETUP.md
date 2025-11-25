# React Native with Django REST Framework Setup Guide

This guide explains how to properly connect a React Native frontend with a Django REST Framework backend using Axios.

## Project Structure

### React Native Frontend Structure

```
qr-system/
├── api/                          # API related files
│   ├── axiosClient.ts           # Reusable Axios client with interceptors
│   ├── config.ts                 # API configuration for different environments
│   └── studentApi.ts             # TODO: Implement once backend is ready
├── app/                          # App screens and navigation
│   ├── (auth)/                   # Authentication related screens
│   ├── (onboarding)/             # Onboarding screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx             # Home screen
│   │   └── students.tsx          # TODO: Implement once backend is ready
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
├── constants/                    # App constants
│   └── colors.ts                 # Color definitions
├── context/                      # React context providers
│   ├── AuthContext.tsx           # Authentication context
│   └── ThemeContext.tsx          # Theme context
├── hooks/                        # Custom React hooks
│   ├── useThemeColor.ts          # Theme color hook
│   └── useStudents.ts            # TODO: Implement once backend is ready
└── assets/                       # Static assets
```

### Django Backend Structure

```
backend/
├── backend/                      # Project configuration
│   ├── settings.py               # Django settings with CORS configuration
│   ├── urls.py                   # Main URL configuration
│   └── wsgi.py                   # WSGI configuration
├── base/                         # Core app
│   ├── models.py                 # TODO: Implement your models here
│   ├── serializer.py             # TODO: Implement your serializers here
│   ├── views.py                  # TODO: Implement your views here
│   └── urls.py                   # App URL configuration
└── authentication/               # Authentication app
    ├── models.py                 # User models
    ├── serializer.py             # Authentication serializers
    ├── views.py                  # Authentication views
    └── urls.py                   # Authentication URLs
```

## API Configuration

### React Native API Client Setup

The API client is configured in `qr-system/api/axiosClient.ts` with:

1. **Request Interceptor**: Automatically adds JWT token from AsyncStorage to all requests
2. **Response Interceptor**: Handles common errors like 401 Unauthorized
3. **Generic Request Methods**: Simplified methods for GET, POST, PUT, PATCH, DELETE

### Environment Configuration

The API configuration in `qr-system/api/config.ts` handles different environments:

```typescript
// For Android emulator
return 'http://10.0.2.2:8000/api';

// For iOS simulator
return 'http://localhost:8000/api';

// For physical devices (replace with your machine's IP)
return 'http://192.168.1.100:8000/api';
```

## Django CORS Configuration

### Settings Configuration

In `backend/backend/settings.py`, we've configured:

1. **CORS Middleware**: Added at the top of MIDDLEWARE list
2. **Allowed Origins**: Configured for development environments
3. **Allowed Headers**: Includes authorization, content-type, etc.
4. **Allowed Methods**: Includes all HTTP methods needed for the API

### CORS Settings

```python
# For development
CORS_ALLOW_ALL_ORIGINS = True

# For production, specify exact origins
CORS_ALLOWED_ORIGINS = [
    "https://yourapp.com",
    "exp://yourapp.com",
]
```

## API Implementation Guide

### Frontend API Module Structure

When implementing your API modules (like `qr-system/api/studentApi.ts`), follow this structure:

```typescript
import { apiRequest } from './axiosClient';

export interface YourModel {
  id: number;
  // Add your model fields here
}

export const yourModelApi = {
  getAll: async (): Promise<YourModel[]> => {
    return apiRequest.get('/your-endpoint/');
  },
  getById: async (id: number): Promise<YourModel> => {
    return apiRequest.get(`/your-endpoint/${id}/`);
  },
  create: async (data: Partial<YourModel>): Promise<YourModel> => {
    return apiRequest.post('/your-endpoint/', data);
  },
  update: async (id: number, data: Partial<YourModel>): Promise<YourModel> => {
    return apiRequest.patch(`/your-endpoint/${id}/`, data);
  },
  delete: async (id: number): Promise<void> => {
    return apiRequest.delete(`/your-endpoint/${id}/`);
  },
};
```

### Custom Hook Structure

When implementing custom hooks (like `qr-system/hooks/useStudents.ts`), follow this structure:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { YourModel } from '../api/yourModelApi';
import { yourModelApi } from '../api/yourModelApi';

interface UseYourModelOptions {
  autoFetch?: boolean;
}

export const useYourModel = (options: UseYourModelOptions = {}) => {
  const { autoFetch = true } = options;
  const [data, setData] = useState<YourModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await yourModelApi.getAll();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
};
```

### Screen Component Structure

When implementing screen components (like `qr-system/app/(tabs)/students.tsx`), follow this structure:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useYourModel } from '../../hooks/useYourModel';

const YourModelScreen: React.FC = () => {
  const { data, loading, error, refresh } = useYourModel({ autoFetch: true });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Model Screen</Text>
      {/* Add your UI components here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default YourModelScreen;
```

## Authentication

### JWT Token Management

1. **Storage**: Tokens are stored in AsyncStorage
2. **Automatic Inclusion**: Tokens are automatically added to request headers
3. **Token Refresh**: Handled by the response interceptor
4. **Logout**: Automatic logout on 401 errors

### Authentication Flow

1. User logs in via authentication endpoints
2. JWT token is stored in AsyncStorage
3. Token is automatically included in all API requests
4. On token expiration, user is redirected to login

## Device Configuration

### Android Emulator

- IP Address: `10.0.2.2` (special alias to host loopback)
- URL: `http://10.0.2.2:8000/api`

### iOS Simulator

- IP Address: `localhost` or `127.0.0.1`
- URL: `http://localhost:8000/api`

### Physical Devices

1. Find your machine's IP address:
   - Windows: `ipconfig` in Command Prompt
   - macOS/Linux: `ifconfig` or `ip addr` in Terminal

2. Update the BASE_URL in `qr-system/api/config.ts`:
   ```typescript
   return 'http://192.168.1.100:8000/api'; // Replace with your IP
   ```

3. Ensure your device and development machine are on the same network

## Setup Instructions

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

4. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd qr-system
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run android    # For Android
   npm run ios        # For iOS
   npm run web        # For Web
   ```

## Best Practices

### API Design

1. **Consistent Endpoints**: Use RESTful conventions
2. **Proper HTTP Methods**: GET, POST, PATCH, DELETE
3. **Status Codes**: Use appropriate HTTP status codes
4. **Error Handling**: Consistent error response format
5. **Pagination**: Implement pagination for large datasets

### Frontend Architecture

1. **Separation of Concerns**: Separate API logic from UI components
2. **Custom Hooks**: Reusable logic in custom hooks
3. **Error Boundaries**: Handle errors gracefully
4. **Loading States**: Provide feedback during API calls
5. **TypeScript**: Use TypeScript for type safety

### Security

1. **HTTPS**: Use HTTPS in production
2. **CORS**: Configure CORS properly
3. **Authentication**: Secure JWT implementation
4. **Validation**: Validate input on both client and server
5. **Environment Variables**: Store sensitive data in environment variables

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS configuration in Django settings
2. **Network Errors**: Verify IP address and port configuration
3. **Authentication Errors**: Check JWT token storage and inclusion
4. **Timeout Errors**: Increase timeout in API configuration
5. **Serialization Errors**: Verify serializer fields and validation

### Debugging Tips

1. Use React Native Debugger for network inspection
2. Check Django logs for server-side errors
3. Use Postman or curl to test API endpoints directly
4. Verify network connectivity between device and server
5. Check firewall settings if running on physical devices