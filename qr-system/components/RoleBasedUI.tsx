import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions } from '@/hooks/usePermissions';

interface RoleBasedUIProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  hideCompletely?: boolean; // If true, component won't render at all when no access
}

export const RoleBasedUI: React.FC<RoleBasedUIProps> = ({ 
  children, 
  allowedRoles, 
  requiredPermissions,
  fallback,
  hideCompletely = false
}) => {
  const { hasAnyRole, hasAnyPermission } = usePermissions();
  
  // Check if user has required role or permission
  const hasAccess = React.useMemo(() => {
    if (allowedRoles && hasAnyRole(allowedRoles as any[])) {
      return true;
    }
    
    if (requiredPermissions && hasAnyPermission(requiredPermissions)) {
      return true;
    }
    
    return false;
  }, [allowedRoles, requiredPermissions, hasAnyRole, hasAnyPermission]);
  
  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If hideCompletely is true, don't render anything
  if (hideCompletely) {
    return null;
  }
  
  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default fallback - render empty view (minimal visual impact)
  return <View style={styles.emptyFallback} />;
};

// Specialized components for common use cases

export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export const TeacherOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI allowedRoles={['teacher']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);


export const ParentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI allowedRoles={['parent']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export const AdminOrTeacher: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI allowedRoles={['admin', 'teacher']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export const StaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI allowedRoles={['admin', 'teacher']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

// Permission-based components
export const CanScan: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI requiredPermissions={['use:scanner']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export const CanManageDiscipline: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI requiredPermissions={['manage:discipline']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export const CanManageAttendance: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedUI requiredPermissions={['manage:attendance']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

const styles = StyleSheet.create({
  emptyFallback: {
    width: 0,
    height: 0,
  },
});