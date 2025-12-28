import { Tabs } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePermissions } from '@/hooks/usePermissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { HapticTab } from '@/components/haptic-tab';
import { RoleBasedUI } from '@/components/RoleBasedUI';


export default function TabLayout() {
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const { canAccessRoute } = usePermissions();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: textColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: cardColor,
          paddingBottom: 8,
          height: 82,
          borderTopColor: useThemeColor('border'),
          borderTopWidth: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'scan' : 'scan-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      
      {/* Scanner Tab - Only for admin/teacher */}
      <RoleBasedUI allowedRoles={['admin', 'teacher']}>
        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Scanner',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'qr-code' : 'qr-code-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* Leaderboard Tab - All users can view */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sahsiah',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      
      {/* Discipline Tab - Only for admin/teacher */}
      <RoleBasedUI allowedRoles={['admin', 'teacher']}>
        <Tabs.Screen
          name="discipline"
          options={{
            title: 'Discipline',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'alert-circle' : 'alert-circle-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* RMT Tab - Only for admin/teacher */}
      <RoleBasedUI allowedRoles={['admin', 'teacher']}>
        <Tabs.Screen
          name="rmt"
          options={{
            title: 'RMT',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'food' : 'food-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* Theme Tab - All users can access */}
      <Tabs.Screen
        name="theme"
        options={{
          title: 'Theme',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'color-palette' : 'color-palette-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      {/* Attendance Tab - Only for admin/teacher */}
      <RoleBasedUI allowedRoles={['admin', 'teacher']}>
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* Reports Tab - Only for admin/teacher/parent */}
      <RoleBasedUI allowedRoles={['admin', 'teacher', 'parent']}>
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* Profile Tab - All users can access their own profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
        
      {/* Student Details Tab - Only for parent */}
      <RoleBasedUI allowedRoles={['parent']}>
        <Tabs.Screen
          name="student-details"
          options={{
            title: 'Child Details',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
      
      {/* Role Test Tab - Only for admin (for testing purposes) */}
      <RoleBasedUI allowedRoles={['admin']}>
        <Tabs.Screen
          name="role-test"
          options={{
            title: 'Test RBAC',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      </RoleBasedUI>
    </Tabs>
  );
}