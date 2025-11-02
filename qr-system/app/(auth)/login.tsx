import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const { login, isLoading } = useAuth();

  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const accentColor = useThemeColor('accent');
  const borderColor = useThemeColor('border');
  const errorColor = useThemeColor('error');
  const mutedColor = useThemeColor('muted');
  const { themeMode } = useTheme();

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      const success = await login(username, password);
      
      if (success) {
        Alert.alert(
          'Login Successful',
          'Welcome to the School App!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
        {/* Logo/Title Section */}
        <View className="items-center mb-12">
          <View
            className="w-24 h-24 rounded-2xl items-center justify-center mb-6"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-3xl font-bold">SA</Text>
          </View>
          <Text
            className="text-3xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            SK Sri Siakap QR-Based System
          </Text>
          <Text
            className="text-center text-sm"
            style={{ color: mutedColor }}
          >
            To ease your school duties.
          </Text>
        </View>

        {/* Login Form */}
        <View
          className="p-6 rounded-2xl shadow-lg"
          style={[styles.card, { backgroundColor: cardColor, borderColor }]}
        >
          <Text
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: textColor }}
          >
            Sign In
          </Text>

          {/* Username Input */}
          <View className="mb-4">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              Username
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border"
              style={[
                styles.input,
                {
                  backgroundColor: themeMode === 'dark' ? '#2A2A2A' : '#F8F8F8',
                  borderColor: errors.username ? errorColor : borderColor,
                  color: textColor,
                },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={mutedColor}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.username && (
              <Text
                className="text-xs mt-1"
                style={{ color: errorColor }}
              >
                {errors.username}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              Password
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border"
              style={[
                styles.input,
                {
                  backgroundColor: themeMode === 'dark' ? '#2A2A2A' : '#F8F8F8',
                  borderColor: errors.password ? errorColor : borderColor,
                  color: textColor,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={mutedColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.password && (
              <Text
                className="text-xs mt-1"
                style={{ color: errorColor }}
              >
                {errors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="py-3 rounded-lg items-center"
            style={[
              styles.loginButton,
              {
                backgroundColor: isLoading ? mutedColor : primaryColor,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                className="font-semibold text-base"
                style={{ color: '#FFFFFF' }}
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View className="mt-6 items-center">
            <Text
              className="text-xs text-center mb-2"
              style={{ color: mutedColor }}
            >
              Demo Credentials:
            </Text>
            <Text
              className="text-xs text-center"
              style={{ color: mutedColor }}
            >
              Teacher: admin / admin123
            </Text>
            <Text
              className="text-xs text-center"
              style={{ color: mutedColor }}
            >
              Guardian: user / user123
            </Text>
          </View>
        </View>
        
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
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
  input: {
    borderWidth: 1,
    fontSize: 16,
    borderRadius: 8,
  },
  loginButton: {
    borderRadius: 8,
  },
  themeToggle: {
    borderWidth: 1,
    borderRadius: 8,
  },
});