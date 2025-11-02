import { Tabs } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabLayout() {
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: textColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: backgroundColor,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => null, // You can add icons here
        }}
      />
    </Tabs>
  );
}