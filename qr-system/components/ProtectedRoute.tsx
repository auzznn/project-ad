import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePermissions } from '@/hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  showAccessDeniedMessage?: boolean;
  onAccessDenied?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requiredPermissions,
  fallback,
  showAccessDeniedMessage = true,
  onAccessDenied
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
  
  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default access denied message
  if (showAccessDeniedMessage) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="lock-closed" size={64} color="#9CA3AF" />
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedMessage}>
          You don't have permission to access this feature.
        </Text>
        {onAccessDenied && (
          <TouchableOpacity 
            style={styles.goBackButton} 
            onPress={onAccessDenied}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
  // Return null if no fallback and no message should be shown
  return null;
};

const styles = StyleSheet.create({
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});