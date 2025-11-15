import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useThemeColor } from "../hooks/useThemeColor";
import { useAuth } from "../context/AuthContext";
import { ModalWrapper, FormField, LoadingButton } from "../components";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const { login, isLoading } = useAuth();

  const textColor = useThemeColor("text");
  const secondaryColor = useThemeColor("secondary");

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
      const success = await login(username, password);

      if (success) {
        console.log("LOGIN RESPONSE:", success);

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
    <ModalWrapper onClose={() => router.back()}>
      <View className="w-full">
        <Text
          className="text-2xl font-bold mb-8 text-center"
          style={{ color: textColor }}
        >
          Welcome Back!
        </Text>
        
        {/* Username Input */}
        <FormField
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          error={errors.username}
        />

        {/* Password Input */}
        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          error={errors.password}
          containerStyle={{ marginBottom: 32 }}
        />

        {/* Login Button */}
        <LoadingButton
          title="Sign In"
          loading={isLoading}
          onPress={handleLogin}
          style={{ marginBottom: 32 }}
        />
      </View>
      
      <View className="mt-4 items-center bg-opacity-10 rounded-2xl p-4">
        <Text
          className="text-sm font-bold text-center mb-2"
          style={{ color: secondaryColor }}
        >
          Created by
        </Text>
        <Text className="text-sm text-center mb-2" style={{ color: textColor }}>
          Anak Indo
        </Text>
      </View>
    </ModalWrapper>
  );
}
