import { useAuth } from '@/context/AuthContext';
import { useContext } from 'react';

export type UserRole = 'admin' | 'teacher' | 'parent';

export interface Permission {
  role: UserRole;
  permissions: string[];
}

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view:scanner',
    'use:scanner',
    'view:discipline',
    'manage:discipline',
    'view:attendance',
    'manage:attendance',
    'view:sahsiah',
    'manage:sahsiah',
    'view:rmt',
    'manage:rmt',
    'view:leaderboard',
    'view:reports'
  ],
  teacher: [
    'view:scanner',
    'use:scanner',
    'view:discipline',
    'manage:discipline',
    'view:attendance',
    'manage:attendance',
    'view:sahsiah',
    'manage:sahsiah',
    'view:rmt',
    'manage:rmt',
    'view:leaderboard',
    'view:reports'
  ],
  parent: [
    'view:attendance',
    'view:sahsiah',
    'view:rmt',
    'view:leaderboard',
    'view:child:profile',
    'view:reports'
  ]
};

export const usePermissions = () => {
  let user = null;
  let hasAuthContext = true;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    hasAuthContext = false;
    console.warn('usePermissions: Auth context not available, defaulting to no permissions');
  }
  
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role as UserRole) : false;
  };
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    return userPermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    return permissions.some(permission => userPermissions.includes(permission));
  };
  
  const canAccessRoute = (routeName: string): boolean => {
    // Map routes to required permissions
    const routePermissions: Record<string, string[]> = {
      'scanner': ['use:scanner'],
      'discipline': ['manage:discipline'],
      'attendance': ['manage:attendance'],
      'sahsiah': ['manage:sahsiah'],
      'rmt': ['manage:rmt'],
      'leaderboard': ['view:leaderboard'],
      'profile': ['view:own:profile'],
      'reports': ['view:reports']
    };
    
    const requiredPermissions = routePermissions[routeName] || [];
    return hasAnyPermission(requiredPermissions);
  };
  
  const getRoleHierarchy = (): UserRole[] => {
    return ['admin', 'teacher', 'parent'];
  };
  
  const isHigherOrEqualRole = (compareRole: UserRole): boolean => {
    if (!user) return false;
    
    const hierarchy = getRoleHierarchy();
    const userIndex = hierarchy.indexOf(user.role as UserRole);
    const compareIndex = hierarchy.indexOf(compareRole);
    
    return userIndex <= compareIndex;
  };
  
  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccessRoute,
    isHigherOrEqualRole,
    userRole: user?.role as UserRole | null,
    allPermissions: user ? ROLE_PERMISSIONS[user.role as UserRole] : [],
    hasAuthContext
  };
};