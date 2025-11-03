import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function TabIndex() {
  const { isAuthenticated, user, logout } = useAuth();
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const accentColor = useThemeColor('accent');
  const primaryColor = useThemeColor('primary');
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  const mutedColor = useThemeColor('muted');
  const { themeMode, toggleTheme, isSystemTheme, useSystemTheme } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <View
        className="flex-1 items-center justify-center"
        style={[styles.container]}
      >
      <View
        className="p-6 rounded-xl shadow-lg mb-6"
        style={[styles.card, { backgroundColor: cardColor, borderColor }]}
      >
        <Text
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: primaryColor }}
        >
          School App
        </Text>
        <Text
          className="text-center mb-6"
          style={{ color: textColor }}
        >
          Welcome to the Malaysian-inspired school app!
        </Text>
        <Text
          className="text-center mb-2 text-sm"
          style={{ color: mutedColor }}
        >
          Logged in as: {user?.username}
        </Text>
        <Text
          className="text-center mb-2 text-sm"
          style={{ color: mutedColor }}
        >
          Role: {user?.role === 'teacher' ? 'Teacher' :
                 user?.role === 'guardian' ? 'Guardian' :
                 user?.role === 'admin' ? 'Administrator' : 'User'}
        </Text>
        <Text
          className="text-center mb-2 text-sm"
          style={{ color: mutedColor }}
        >
          Current theme: {themeMode}
        </Text>
        <Text
          className="text-center mb-4 text-xs"
          style={{ color: mutedColor }}
        >
          {isSystemTheme ? 'Following system settings' : 'Manual selection'}
        </Text>
        <View
          className="px-4 py-2 rounded-lg mb-4"
          style={{ backgroundColor: accentColor }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: primaryColor }}
          >
            Get Started
          </Text>
        </View>
        
        <TouchableOpacity
          className="px-4 py-2 rounded-lg border mb-2"
          style={[styles.themeToggle, { borderColor, backgroundColor: 'transparent' }]}
          onPress={toggleTheme}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: textColor }}
          >
            Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="px-4 py-2 rounded-lg border"
          style={[styles.themeToggle, { borderColor, backgroundColor: isSystemTheme ? primaryColor : 'transparent' }]}
          onPress={useSystemTheme}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: isSystemTheme ? accentColor : textColor }}
          >
            Use System Theme
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="p-6 rounded-xl shadow-lg"
        style={[styles.card, { backgroundColor: cardColor, borderColor }]}
      >
        <Text
          className="text-lg font-semibold mb-4 text-center"
          style={{ color: textColor }}
        >
          Quick Actions
        </Text>
        
        <TouchableOpacity
          className="px-6 py-3 rounded-lg mb-3"
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/login')}
        >
          <Text
            className="text-center font-semibold text-white"
          >
            Sign In
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="px-6 py-3 rounded-lg border"
          style={[styles.actionButton, { borderColor, backgroundColor: 'transparent' }]}
          onPress={() => router.push('/login')}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: primaryColor }}
          >
            Login Page Demo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="px-6 py-3 rounded-lg border mt-3"
          style={[styles.actionButton, { borderColor, backgroundColor: 'transparent' }]}
          onPress={async () => {
            await logout();
            router.replace('/(onboarding)');
          }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: primaryColor }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeToggle: {
    borderWidth: 1,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
  },
});