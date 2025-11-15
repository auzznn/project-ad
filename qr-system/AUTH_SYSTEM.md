# Login Authorization System Documentation

This document provides a comprehensive overview of the login authorization system implemented in the EduQR App, including architecture, usage, and implementation details.

## Overview

The login authorization system is a secure, theme-aware authentication flow that provides user access control with role-based permissions and persistent sessions. It follows Apple Human Interface Guidelines and integrates seamlessly with the Malaysian-inspired theming system. The system supports both hardcoded authentication for demo purposes and backend API integration for production use.

## Architecture

### File Structure
```
qr-system/
├── context/
│   ├── AuthContext.tsx      # Authentication state management
│   └── ThemeContext.tsx     # Theme management
├── hooks/
│   └── useThemeColor.ts     # Theme color helper
├── api/
│   ├── authApi.ts           # Authentication API endpoints
│   ├── axiosClient.ts       # HTTP client with interceptors
│   └── config.ts            # API configuration
├── app/
│   ├── _layout.tsx          # Root layout with providers
│   ├── _entry.tsx           # Authentication entry point
│   ├── login.tsx            # Login screen
│   ├── (onboarding)/         # Onboarding screens
│   │   ├── _layout.tsx      # Onboarding layout
│   │   └── index.tsx        # Onboarding flow
│   └── (tabs)/              # Protected tab navigation
│       ├── _layout.tsx      # Tab layout
│       └── index.tsx        # Home screen
└── components/
    ├── FormField.tsx        # Form input component
    ├── LoadingButton.tsx    # Button with loading state
    └── ModalWrapper.tsx     # Modal wrapper component
```

## Core Components

### 1. Authentication Context (`context/AuthContext.tsx`)

#### Purpose
Manages user authentication state, session persistence, and provides authentication methods throughout the app.

#### Features
- **User State Management**: Tracks current user and authentication status
- **Session Persistence**: Uses AsyncStorage to maintain login state across app restarts
- **Role-Based Access**: Supports teacher and guardian roles with different permissions
- **Hardcoded Credentials**: Secure authentication without backend dependencies for demo purposes
- **Loading States**: Proper loading indicators during authentication operations

#### API
```typescript
interface AuthContextType {
  user: User | null;           // Current logged-in user
  isLoading: boolean;           // Authentication loading state
  isAuthenticated: boolean;      // Authentication status
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface User {
  username: string;
  role: 'teacher' | 'guardian';
}
```

#### Hardcoded Credentials
- **Teacher**: `admin` / `admin123`
- **Guardian**: `user` / `user123`

#### Usage
```typescript
const { user, isAuthenticated, login, logout } = useAuth();

// Check authentication status
if (isAuthenticated) {
  // User is logged in
  console.log('Logged in as:', user?.username);
} else {
  // User is not logged in
  console.log('User not authenticated');
}

// Login user
const success = await login(username, password);
if (success) {
  // Login successful
} else {
  // Login failed
}

// Logout user
await logout();
```

### 2. Authentication API (`api/authApi.ts`)

#### Purpose
Provides API integration for authentication with backend support while maintaining fallback to hardcoded credentials.

#### Features
- **Backend Integration**: Connects to Django backend for authentication
- **Token Management**: Handles JWT tokens for secure API access
- **Fallback Support**: Maintains hardcoded credentials for demo purposes
- **Error Handling**: Proper error responses for authentication failures

#### API
```typescript
interface LoginResponse {
  access: string;    // JWT access token
  refresh: string;   // JWT refresh token
}

interface LoginData {
  username: string;
  password: string;
}

export const authApi = {
  login: (data: LoginData): Promise<LoginResponse> =>
    apiRequest.post('/authentication/token/', data),
};
```

### 3. Login Screen (`app/login.tsx`)

#### Purpose
Provides a secure, user-friendly login interface that complies with Apple Human Interface Guidelines.

#### Features
- **Apple Design Compliance**: Clean, minimal interface with proper spacing and typography
- **Theme Integration**: Fully integrated with the Malaysian-inspired theming system
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Visual feedback during authentication process
- **Modal Presentation**: Presented as a modal overlay
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Accessibility**: Proper labels and semantic structure

#### UI Components
- **Modal Wrapper**: Clean modal presentation with backdrop
- **Form Fields**: Username and password with proper validation
- **Error Handling**: Inline error messages for invalid inputs
- **Loading Button**: Loading state and disabled state management
- **Navigation**: Seamless integration with app navigation

#### Validation Rules
- **Username**: Required field, cannot be empty
- **Password**: Required field, minimum 6 characters
- **Real-time Validation**: Immediate feedback on user input
- **Error Messages**: Clear, contextual error descriptions

### 4. Entry Point (`app/_entry.tsx`)

#### Purpose
Acts as the app's authentication gate, redirecting users based on their authentication status.

#### Features
- **Authentication Check**: Verifies user session on app launch
- **Smart Routing**: Redirects to onboarding if not authenticated, tabs if authenticated
- **Loading Screen**: Shows loading indicator while checking authentication status
- **Theme Awareness**: Respects current theme during loading state

#### Flow
```
App Launch → Check Authentication Status → Redirect:
├── Not Authenticated → Onboarding Flow → Login Screen
└── Authenticated → Tab Navigation
```

### 5. Onboarding Flow (`app/(onboarding)/index.tsx`)

#### Purpose
Provides an engaging introduction to the app's features for new users.

#### Features
- **Interactive Slides**: Animated onboarding with feature highlights
- **Skip Option**: Allows users to skip directly to login
- **Theme Integration**: Consistent with app's theming system
- **Smooth Transitions**: Fluid animations between screens
- **Call-to-Action**: Clear navigation to login screen

### 6. Protected Routes (`app/(tabs)/index.tsx`)

#### Purpose
Ensures only authenticated users can access protected content.

#### Features
- **Authentication Guard**: Redirects unauthenticated users to login
- **User Information Display**: Shows current user and role
- **Dashboard Interface**: Quick stats and actions for authenticated users
- **Theme Integration**: Maintains theme consistency across app
- **Loading States**: Handles authentication checking states

#### Protection Mechanism
```typescript
const { isAuthenticated, user, logout } = useAuth();

// User information is displayed only when authenticated
const username = user?.username || "User";
```

## Security Features

### 1. Session Management
- **Persistent Storage**: User sessions stored securely in AsyncStorage
- **Token Management**: JWT tokens stored for API authentication
- **Automatic Cleanup**: Sessions cleared on logout
- **Session Validation**: Verified on app launch

### 2. Credential Security
- **Hardcoded Validation**: No network exposure of credentials for demo
- **Backend Integration**: Secure API authentication with JWT tokens
- **Input Sanitization**: Proper input validation and sanitization
- **Error Handling**: Secure error message display without information leakage

### 3. Role-Based Access
- **Teacher Role**: Full access to all app features
- **Guardian Role**: Limited access based on user permissions
- **Role Verification**: Server-side validation in production

## Theme Integration

### 1. Consistent Design
- **Color Harmony**: All auth screens use Malaysian-inspired color palette
- **Dark Mode Support**: Seamless theme switching across authentication flow
- **Typography**: Consistent text styling and hierarchy
- **Spacing**: Apple-recommended padding and margins

### 2. Adaptive UI
- **Theme Awareness**: Components respond to theme changes
- **System Theme**: Respects device color scheme preferences
- **Contrast Optimization**: Improved visibility in both light and dark modes
- **Modal Presentation**: Transparent backgrounds for modal overlays

## Navigation Flow

### 1. Authentication Flow
```
1. App Launch → _entry.tsx
2. Check Session → AsyncStorage verification
3. Route Decision → Based on auth status
4. Not Authenticated → /(onboarding) → /login
5. Login Success → /(tabs) (home)
6. Session Active → Persistent authentication
```

### 2. Route Structure
- **Public Routes**: Accessible without authentication (onboarding)
- **Protected Routes**: Require authentication (tabs)
- **Auth Routes**: Specialized authentication screens (login)
- **Modal Presentation**: Login screen presents as modal overlay

## Implementation Guidelines

### 1. Adding New Auth Screens
1. Create new screen in appropriate folder (onboarding or auth)
2. Use modal wrapper for consistent presentation
3. Update navigation in protected components
4. Test authentication flow thoroughly

### 2. Modifying Authentication
1. Update `AuthContext.tsx` for new auth methods
2. Modify API endpoints in `authApi.ts` if needed
3. Update validation rules as needed
4. Test with different user roles
5. Update documentation accordingly

### 3. Security Best Practices
1. Never log sensitive information
2. Use secure storage for session data and tokens
3. Implement proper error handling
4. Validate inputs on both client and server
5. Use HTTPS for all network requests
6. Implement token refresh mechanism for production

## Troubleshooting

### Common Issues

#### 1. Login Not Working
- **Check**: Import paths in auth screens
- **Verify**: AuthContext is properly initialized
- **Test**: With hardcoded credentials
- **Console**: Check for authentication errors
- **API**: Verify backend connection if using API authentication

#### 2. Theme Issues
- **Verify**: ThemeProvider wraps auth screens
- **Check**: useThemeColor hook usage
- **Test**: Theme switching in auth flow
- **Validate**: Color contrast and visibility
- **Modal**: Ensure modal transparency is working

#### 3. Navigation Problems
- **Check**: Route definitions in Expo Router
- **Verify**: Navigation paths are correct
- **Test**: Authentication redirects
- **Validate**: Protected route implementation
- **Entry Point**: Ensure _entry.tsx is properly configured

#### 4. API Integration Issues
- **Check**: API configuration in config.ts
- **Verify**: Token storage in AsyncStorage
- **Test**: Network requests with proper headers
- **Validate**: Error handling in axios interceptors

### Debug Tips
```typescript
// Check authentication state
console.log('Auth state:', { user, isAuthenticated, isLoading });

// Monitor navigation
console.log('Current route:', router.pathname);

// Verify theme application
console.log('Current theme:', themeMode);

// Check API tokens
console.log('Stored token:', await AsyncStorage.getItem('authToken'));
```

## Future Enhancements

### 1. Authentication Features
- **Biometric Login**: Touch ID/Face ID integration
- **Social Login**: Google/Apple ID authentication
- **Multi-Factor**: SMS or authenticator app support
- **Session Timeout**: Automatic logout after inactivity
- **Backend Integration**: Full Django backend authentication

### 2. Security Improvements
- **Token Refresh**: Automatic session renewal
- **Device Binding**: Limit sessions to trusted devices
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track authentication attempts
- **Certificate Pinning**: Enhanced network security

### 3. User Experience
- **Remember Me**: Persistent login option
- **Password Reset**: Self-service password recovery
- **Account Switching**: Multiple account support
- **Progressive Web**: Enhanced web authentication
- **Offline Support**: Authentication with limited connectivity

## Conclusion

The login authorization system provides a secure, user-friendly authentication experience that integrates seamlessly with the app's theming system and follows Apple design guidelines. It supports both demo mode with hardcoded credentials and production mode with backend API integration. The system is designed to be easily extensible for future authentication enhancements while maintaining security and usability standards.