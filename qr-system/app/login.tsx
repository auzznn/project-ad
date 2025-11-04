import React, { useState } from "react";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeColor } from "../hooks/useThemeColor";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const { login, isLoading } = useAuth();

  const backgroundColor = useThemeColor("background");
  const cardColor = useThemeColor("card");
  const textColor = useThemeColor("text");
  const primaryColor = useThemeColor("primary");
  const accentColor = useThemeColor("accent");
  const secondaryColor = useThemeColor("secondary");
  const borderColor = useThemeColor("border");
  const errorColor = useThemeColor("error");
  const mutedColor = useThemeColor("muted");
  const { themeMode } = useTheme();

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const success = await authApi.login({username, password});

      if (success) {
        Alert.alert("Login Successful", "Welcome to the App!", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      Alert.alert("Login Failed", "An error occurred. Please try again.");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: backgroundColor,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -6,
          },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 15,
        }}
      >
        {/* Close button for modal */}
        <SafeAreaView className="flex-row justify-end px-6 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: secondaryColor + "20" }}
          >
            <Text
              style={{ color: secondaryColor }}
              className="text-xl font-semibold"
            >
              ✕
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View className="flex-1 px-6  justify-between">
          {/* Login Form */}
          <View className="w-full">
            <Text
              className="text-2xl font-bold mb-8 text-center"
              style={{ color: textColor }}
            >
              Welcome Back!
            </Text>
            {/* Username Input */}
            <View className="mb-6">
              <Text
                className="text-base font-semibold mb-3"
                style={{ color: textColor }}
              >
                Username
              </Text>
              <View className="relative">
                <TextInput
                  className="px-5 py-4 rounded-2xl border pr-12"
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        themeMode === "dark" ? "#2A2A2A" : "#F8F8F8",
                      borderColor: errors.username
                        ? errorColor
                        : username.length > 0
                          ? accentColor
                          : borderColor,
                      color: textColor,
                      fontSize: 16,
                      borderWidth: username.length > 0 ? 2 : 1,
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
                {username.length > 0 && (
                  <View
                    className="absolute right-4 top-1/2 -mt-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </View>
              {errors.username && (
                <Text
                  className="text-sm mt-2 ml-1"
                  style={{ color: errorColor }}
                >
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text
                className="text-base font-semibold mb-3"
                style={{ color: textColor }}
              >
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="px-5 py-4 rounded-2xl border pr-12"
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        themeMode === "dark" ? "#2A2A2A" : "#F8F8F8",
                      borderColor: errors.password
                        ? errorColor
                        : password.length > 0
                          ? accentColor
                          : borderColor,
                      color: textColor,
                      fontSize: 16,
                      borderWidth: password.length > 0 ? 2 : 1,
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
                {password.length > 0 && (
                  <View
                    className="absolute right-4 top-1/2 -mt-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </View>
              {errors.password && (
                <Text
                  className="text-sm mt-2 ml-1"
                  style={{ color: errorColor }}
                >
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="py-5 rounded-2xl items-center mb-8 shadow-lg"
              style={[
                styles.loginButton,
                {
                  backgroundColor: isLoading ? mutedColor : primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  className="font-bold text-lg"
                  style={{ color: "#FFFFFF" }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <View
              className="items-center bg-opacity-10 rounded-2xl p-4"
              style={{ backgroundColor: accentColor + "15" }}
            >
              <Text
                className="text-sm font-semibold text-center mb-3"
                style={{ color: secondaryColor }}
              >
                Demo Credentials:
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center justify-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <Text className="text-sm" style={{ color: textColor }}>
                    Teacher: admin / admin123
                  </Text>
                </View>
                <View className="flex-row items-center justify-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: accentColor }}
                  />
                  <Text className="text-sm" style={{ color: textColor }}>
                    Guardian: user / user123
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="mt-4 items-center bg-opacity-10 rounded-2xl p-4">
            <Text
              className="text-sm font-bold text-center mb-2"
              style={{ color: secondaryColor }}
            >
              Created by
            </Text>
            <Text className="text-sm text-center mb-2" style={{ color: textColor }}>
              Team 2 - SECJ3104-01
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 16,
  },
  loginButton: {
    borderRadius: 16,
  },
});
