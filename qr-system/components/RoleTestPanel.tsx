import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleBasedUI, AdminOnly, TeacherOnly, ParentOnly, AdminOrTeacher, CanScan, CanManageDiscipline } from '@/components/RoleBasedUI';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TestUser {
  role: 'admin' | 'teacher' | 'parent';
  name: string;
}

const testUsers: TestUser[] = [
  { role: 'admin', name: 'Admin User' },
  { role: 'teacher', name: 'Teacher User' },
  { role: 'parent', name: 'Parent User' },
];

export const RoleTestPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userRole, hasPermission, hasAnyPermission, allPermissions } = usePermissions();
  const [selectedTestRole, setSelectedTestRole] = useState<typeof testUsers[0] | null>(null);
  
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const successColor = useThemeColor('success');
  const mutedColor = useThemeColor('muted');

  const simulateRole = (role: typeof testUsers[0]) => {
    setSelectedTestRole(role);
  };

  const resetSimulation = () => {
    setSelectedTestRole(null);
  };

  const currentRole = selectedTestRole?.role || userRole;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Role-Based Access Control Test
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: mutedColor }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Role Display */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Current Role</Text>
          <Text style={[styles.currentRole, { color: primaryColor }]}>
            {selectedTestRole ? `${selectedTestRole.name} (Simulated)` : userRole || 'Unknown'}
          </Text>
          {selectedTestRole && (
            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: mutedColor }]} 
              onPress={resetSimulation}
            >
              <Text style={styles.resetButtonText}>Reset to Actual Role</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Role Simulation */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Simulate Different Roles</Text>
          <View style={styles.roleButtons}>
            {testUsers.map((user) => (
              <TouchableOpacity
                key={user.role}
                style={[
                  styles.roleButton,
                  { 
                    backgroundColor: selectedTestRole?.role === user.role ? primaryColor : cardColor,
                    borderColor 
                  }
                ]}
                onPress={() => simulateRole(user)}
              >
                <Text style={[
                  styles.roleButtonText,
                  { 
                    color: selectedTestRole?.role === user.role ? 'white' : textColor 
                  }
                ]}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Permission Tests */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Permission Tests</Text>
          
          <View style={styles.permissionTest}>
            <Text style={[styles.testLabel, { color: textColor }]}>Can Access Scanner:</Text>
            <RoleBasedUI requiredPermissions={['use:scanner']}>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </RoleBasedUI>
            <RoleBasedUI requiredPermissions={['use:scanner']} fallback={
              <Text style={[styles.testResult, { color: '#EF4444' }]}>✗ No</Text>
            }>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </RoleBasedUI>
          </View>

          <View style={styles.permissionTest}>
            <Text style={[styles.testLabel, { color: textColor }]}>Can Manage Discipline:</Text>
            <CanManageDiscipline>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </CanManageDiscipline>
            <CanManageDiscipline fallback={
              <Text style={[styles.testResult, { color: '#EF4444' }]}>✗ No</Text>
            }>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </CanManageDiscipline>
          </View>

          <View style={styles.permissionTest}>
            <Text style={[styles.testLabel, { color: textColor }]}>Can View Reports:</Text>
            <RoleBasedUI allowedRoles={['admin', 'teacher', 'parent']}>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </RoleBasedUI>
            <RoleBasedUI allowedRoles={['admin', 'teacher', 'parent']} fallback={
              <Text style={[styles.testResult, { color: '#EF4444' }]}>✗ No</Text>
            }>
              <Text style={[styles.testResult, { color: successColor }]}>✓ Yes</Text>
            </RoleBasedUI>
          </View>
        </View>

        {/* UI Component Tests */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>UI Component Tests</Text>
          
          <AdminOnly>
            <View style={[styles.componentTest, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.componentTestText}>Admin Only Content</Text>
            </View>
          </AdminOnly>

          <TeacherOnly fallback={
            <View style={[styles.componentTest, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.componentTestText}>Teacher Content Hidden</Text>
            </View>
          }>
            <View style={[styles.componentTest, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.componentTestText}>Teacher Only Content</Text>
            </View>
          </TeacherOnly>


          <ParentOnly>
            <View style={[styles.componentTest, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.componentTestText}>Parent Only Content</Text>
            </View>
          </ParentOnly>

          <AdminOrTeacher>
            <View style={[styles.componentTest, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.componentTestText}>Admin/Teacher Content</Text>
            </View>
          </AdminOrTeacher>
        </View>

        {/* All Permissions List */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>All Permissions for Current Role</Text>
          {allPermissions.length > 0 ? (
            allPermissions.map((permission, index) => (
              <Text key={index} style={[styles.permissionItem, { color: mutedColor }]}>
                • {permission}
              </Text>
            ))
          ) : (
            <Text style={[styles.noPermissions, { color: mutedColor }]}>
              No permissions available
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  currentRole: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleButtonText: {
    fontWeight: '500',
  },
  permissionTest: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testLabel: {
    fontSize: 14,
    flex: 1,
  },
  testResult: {
    fontSize: 14,
    fontWeight: '600',
  },
  componentTest: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  componentTestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  permissionItem: {
    fontSize: 14,
    paddingVertical: 2,
  },
  noPermissions: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});