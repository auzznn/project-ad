import { Tabs } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { HapticTab } from '@/components/haptic-tab';


export default function TabLayout() {
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');

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
      <Tabs.Screen
        name="discipline"
        options={{
          title: 'Discipline',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'shield-check' : 'shield-check-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
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
      {/*
        Add your tabs here once backend is ready
        Example:
        <Tabs.Screen
          name="yourModel"
          options={{
            title: 'Your Model',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'icon-name' : 'icon-name-outline'}
                size={size || 22}
                color={color}
              />
            ),
          }}
        />
      */}
    </Tabs>
  );
}