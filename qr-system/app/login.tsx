import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useThemeColor } from "../hooks/useThemeColor";
import { useAuth } from "../context/AuthContext";
import { ModalWrapper, FormField, LoadingButton } from "../components";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const { login, isLoading } = useAuth();

  const textColor = useThemeColor("text");
  const secondaryColor = useThemeColor("secondary");
  const borderColor = useThemeColor("border");
  const accentColor = useThemeColor("accent");
  const errorColor = useThemeColor("error");
  const mutedColor = useThemeColor("muted");
  const cardColor = useThemeColor("card");

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
        <View className="mb-6" style={{ marginBottom: 32 }}>
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: textColor }}
          >
            Password
          </Text>
          <View className="relative">
            <TextInput
              className="px-5 py-4 rounded-2xl border pr-12"
              style={{
                backgroundColor: cardColor,
                borderColor: errors.password ? errorColor : password ? accentColor : borderColor,
                color: textColor,
                borderWidth: password ? 2 : 1,
              }}
              placeholder="Enter your password"
              placeholderTextColor={mutedColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -mt-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={mutedColor}
              />
            </TouchableOpacity>
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
