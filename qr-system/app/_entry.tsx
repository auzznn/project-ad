import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function EntryScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={{ backgroundColor }} className="flex-1 items-center justify-center">
        <View className="items-center">
          <ActivityIndicator size="large" color={textColor} />
          <Text 
            className="mt-4 text-lg"
            style={{ color: textColor }}
          >
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Redirect to appropriate screen based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  // Show login screen for unauthenticated users
  return <Redirect href="/login" />;
}