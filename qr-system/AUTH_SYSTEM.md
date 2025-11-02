# Login Authorization System Documentation

This document provides a comprehensive overview of the login authorization system implemented in the School App, including architecture, usage, and implementation details.

## Overview

The login authorization system is a secure, theme-aware authentication flow that provides user access control with role-based permissions and persistent sessions. It follows Apple Human Interface Guidelines and integrates seamlessly with the Malaysian-inspired theming system.

## Architecture

### File Structure
```
qr-system/
├── context/
│   ├── AuthContext.tsx      # Authentication state management
│   └── ThemeContext.tsx   # Theme management
├── hooks/
│   └── useThemeColor.ts     # Theme color helper
├── app/
│   ├── _layout.tsx           # Root layout with providers
│   ├── _entry.tsx           # Authentication entry point
│   ├── index.tsx             # Protected home page
│   └── (auth)/               # Authentication screens
│       ├── _layout.tsx       # Auth-specific layout
│       └── login.tsx          # Login screen
└── constants/
    └── colors.ts              # Theme definitions
```

## Core Components

### 1. Authentication Context (`context/AuthContext.tsx`)

#### Purpose
Manages user authentication state, session persistence, and provides authentication methods throughout the app.

#### Features
- **User State Management**: Tracks current user and authentication status
- **Session Persistence**: Uses AsyncStorage to maintain login state across app restarts
- **Role-Based Access**: Supports admin and user roles with different permissions
- **Hardcoded Credentials**: Secure authentication without backend dependencies
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
  role: 'admin' | 'user';
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

### 2. Login Screen (`app/(auth)/login.tsx`)

#### Purpose
Provides a secure, user-friendly login interface that complies with Apple Human Interface Guidelines.

#### Features
- **Apple Design Compliance**: Clean, minimal interface with proper spacing and typography
- **Theme Integration**: Fully integrated with the Malaysian-inspired theming system
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Visual feedback during authentication process
- **Credential Display**: Shows demo credentials for easy testing
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Accessibility**: Proper labels and semantic HTML structure

#### UI Components
- **Logo/Branding**: School App logo with Malaysian colors
- **Input Fields**: Username and password with proper validation
- **Error Handling**: Inline error messages for invalid inputs
- **Submit Button**: Loading state and disabled state management
- **Help Text**: Demo credentials displayed for testing
- **Navigation**: Seamless integration with app navigation

#### Validation Rules
- **Username**: Required field, cannot be empty
- **Password**: Required field, minimum 6 characters
- **Real-time Validation**: Immediate feedback on user input
- **Error Messages**: Clear, contextual error descriptions

### 3. Entry Point (`app/_entry.tsx`)

#### Purpose
Acts as the app's authentication gate, redirecting users based on their authentication status.

#### Features
- **Authentication Check**: Verifies user session on app launch
- **Smart Routing**: Redirects to login if not authenticated, home if authenticated
- **Loading Screen**: Shows loading indicator while checking authentication status
- **Theme Awareness**: Respects current theme during loading state

#### Flow
```
App Launch → Check Authentication Status → Redirect:
├── Not Authenticated → Login Screen
└── Authenticated → Home Page
```

### 4. Protected Routes (`app/index.tsx`)

#### Purpose
Ensures only authenticated users can access protected content.

#### Features
- **Authentication Guard**: Redirects unauthenticated users to login
- **User Information Display**: Shows current user and role
- **Logout Functionality**: Provides secure logout option
- **Theme Integration**: Maintains theme consistency across app
- **Loading States**: Handles authentication checking states

#### Protection Mechanism
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.replace('/auth/login');
  }
}, [isAuthenticated, isLoading]);
```

## Security Features

### 1. Session Management
- **Persistent Storage**: User sessions stored securely in AsyncStorage
- **Automatic Cleanup**: Sessions cleared on logout
- **Session Validation**: Verified on app launch

### 2. Credential Security
- **Hardcoded Validation**: No network exposure of credentials
- **Input Sanitization**: Proper input validation and sanitization
- **Error Handling**: Secure error message display without information leakage

### 3. Role-Based Access
- **Admin Role**: Full access to all app features
- **User Role**: Limited access based on user permissions
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

## Navigation Flow

### 1. Authentication Flow
```
1. App Launch → _entry.tsx
2. Check Session → AsyncStorage verification
3. Route Decision → Based on auth status
4. Login Required → /auth/login
5. Login Success → / (home)
6. Session Active → Persistent authentication
```

### 2. Route Structure
- **Public Routes**: Accessible without authentication
- **Protected Routes**: Require authentication
- **Auth Routes**: Specialized authentication screens
- **Modal Presentation**: Auth screens present as overlays

## Implementation Guidelines

### 1. Adding New Auth Screens
1. Create new screen in `app/(auth)/` folder
2. Use auth layout for consistent presentation
3. Update navigation in protected components
4. Test authentication flow thoroughly

### 2. Modifying Authentication
1. Update `AuthContext.tsx` for new auth methods
2. Modify validation rules as needed
3. Test with different user roles
4. Update documentation accordingly

### 3. Security Best Practices
1. Never log sensitive information
2. Use secure storage for session data
3. Implement proper error handling
4. Validate inputs on both client and server
5. Use HTTPS for any network requests

## Troubleshooting

### Common Issues

#### 1. Login Not Working
- **Check**: Import paths in auth screens
- **Verify**: AuthContext is properly initialized
- **Test**: With hardcoded credentials
- **Console**: Check for authentication errors

#### 2. Theme Issues
- **Verify**: ThemeProvider wraps auth screens
- **Check**: useThemeColor hook usage
- **Test**: Theme switching in auth flow
- **Validate**: Color contrast and visibility

#### 3. Navigation Problems
- **Check**: Route definitions in Expo Router
- **Verify**: Navigation paths are correct
- **Test**: Authentication redirects
- **Validate**: Protected route implementation

### Debug Tips
```typescript
// Check authentication state
console.log('Auth state:', { user, isAuthenticated, isLoading });

// Monitor navigation
console.log('Current route:', router.pathname);

// Verify theme application
console.log('Current theme:', themeMode);
```

## Future Enhancements

### 1. Authentication Features
- **Biometric Login**: Touch ID/Face ID integration
- **Social Login**: Google/Apple ID authentication
- **Multi-Factor**: SMS or authenticator app support
- **Session Timeout**: Automatic logout after inactivity

### 2. Security Improvements
- **Token Refresh**: Automatic session renewal
- **Device Binding**: Limit sessions to trusted devices
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track authentication attempts

### 3. User Experience
- **Remember Me**: Persistent login option
- **Password Reset**: Self-service password recovery
- **Account Switching**: Multiple account support
- **Progressive Web**: Enhanced web authentication

## Conclusion

The login authorization system provides a secure, user-friendly authentication experience that integrates seamlessly with the app's theming system and follows Apple design guidelines. It's designed to be easily extensible for future authentication enhancements while maintaining security and usability standards.