import { Tabs } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePermissions } from '@/hooks/usePermissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { HapticTab } from '@/components/haptic-tab';
import React from 'react';

export default function TabLayout() {
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const { hasAnyRole } = usePermissions();

  // Check if user has specific roles
  const isAdminOrTeacher = hasAnyRole(['admin', 'teacher']);
  const isAdmin = hasAnyRole(['admin']);
  const isParent = hasAnyRole(['parent']);

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
          borderTopWidth: 1.5,
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
      {isAdminOrTeacher && (
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
      )}
      
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
        <Tabs.Screen
          name="discipline"
          options={{
            title: 'Discipline',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'alert-circle' : 'alert-circle-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />      
      {/* RMT Tab - Only for admin/teacher */}
      {isAdminOrTeacher && (
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
      )}
      
      {/* Theme Tab - All users can access */}
      {/* Attendance Tab - Only for admin/teacher */}

      
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
      {isAdmin && (
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
      )}
      
    </Tabs>
  );
}