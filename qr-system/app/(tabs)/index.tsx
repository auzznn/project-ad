import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { studentApi } from "@/api/studentApi";

export default function TabIndex() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Using placeholder username as requested
  const username = user?.username || "User";
  const role = user?.role;
  
  // Get theme colors
  const backgroundColor = useThemeColor("background");
  const cardColor = useThemeColor("card");
  const textColor = useThemeColor("text");
  const mutedColor = useThemeColor("muted");
  const primaryColor = useThemeColor("primary");
  const borderColor = useThemeColor("border");
  const successColor = useThemeColor("success");

  // Quick stats data (placeholder)
  const quickStats = [
    { label: "Today's Check-ins", value: "3", icon: "checkmark-circle", color: successColor },
    { label: "Pending Tasks", value: "5", icon: "time", color: primaryColor },
    { label: "Messages", value: "2", icon: "chatbubble", color: primaryColor },
  ];

  // Function to reset student data
  const resetStudentData = async () => {
    Alert.alert(
      "Reset Student Data",
      "Are you sure you want to reset all student action data? This will clear all attendance, RMT, Sahsiah records, and points for today.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const today = new Date().toISOString().split('T')[0];
              
              // Try to reset sahsiah data via API first
              try {
                await studentApi.resetSahsiah();
              } catch (apiError) {
                console.log('API reset failed, falling back to local storage reset:', apiError);
                // If API fails, continue with local storage reset
              }
              
              // Get all keys to remove student-related data
              const allKeys = await AsyncStorage.getAllKeys();
              
              // More comprehensive filter to catch all sahsiah related keys
              const sahsiahKeys = allKeys.filter(key =>
                key.startsWith('sahsiah_') ||
                key.includes('sahsiah')
              );
              
              const keysToRemove = [
                ...allKeys.filter(key =>
                  key.startsWith('student_actions_') ||
                  key.startsWith('student_points_') ||
                  key.startsWith('today_deeds_') ||
                  key.startsWith('class_stats_') ||
                  key === 'last_actions_reset_date'
                ),
                ...sahsiahKeys
              ];
              
              // Remove duplicates by converting to Set and back to array
              const uniqueKeysToRemove = Array.from(new Set(keysToRemove));
              
              // Remove all related keys
              if (uniqueKeysToRemove.length > 0) {
                await AsyncStorage.multiRemove(uniqueKeysToRemove);
              }
              
              Alert.alert("Success", "Student data, points, and Sahsiah records have been reset successfully.");
            } catch (error) {
              console.error('Failed to reset student data:', error);
              Alert.alert("Error", "Failed to reset student data. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Logout handler function
  const handleLogout = async () => {
    await logout();
    router.replace("/(onboarding)");
  };

  // Quick actions
  const quickActions = [
    {
      title: "Scan QR Code",
      icon: "qr-code-outline",
      onPress: () => router.push("/scanner"),
      primary: true
    },
    {
      title: "Generate QR Code",
      icon: "add-circle-outline",
      onPress: () => router.push("/(tabs)/qr-generator"),
      primary: true
    },
    {
      title: "Reset Student Data",
      icon: "refresh-outline",
      onPress: resetStudentData,
      primary: false
    },
    {
      title: "Log Out",
      icon: "log-out-outline",
      onPress: handleLogout,
      primary: true
    }
  ];

  const getActionClassName = (primary: boolean) => {
    return `rounded-2xl p-5 mb-3 items-center shadow-lg ${primary ? 'border-0' : 'border'}`;
  };

  const getTextClassName = (primary: boolean) => {
    return `text-base font-semibold text-center${primary ? ' text-white' : ''}`;
  };


  return (
    <SafeAreaView className="flex-1 pt-8" style={{ backgroundColor }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header Section */}
        <View className="px-5 pt-5 pb-8">
          <View className="flex-row items-center">
            <View 
              className="w-16 h-16 rounded-full justify-center items-center mr-4 shadow-md border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-semibold mb-1" style={{ color: textColor }}>
                Hey, {username} 👋 You are a {role}
              </Text>
              <Text className="text-base opacity-80" style={{ color: mutedColor }}>
                Welcome back to your dashboard
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4 px-5" style={{ color: textColor }}>
            Quick Overview
          </Text>
          <View className="flex-row justify-between px-5">
            {quickStats.map((stat, index) => (
              <View 
                key={index}
                className="w-[30%] rounded-2xl p-4 items-center shadow-md border"
                style={{ backgroundColor: cardColor, borderColor }}
              >
                <Ionicons 
                  name={stat.icon as any} 
                  size={24} 
                  color={stat.color} 
                  className="mb-2" 
                />
                <Text className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                  {stat.value}
                </Text>
                <Text className="text-xs text-center" style={{ color: mutedColor }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4 px-5" style={{ color: textColor }}>
            Quick Actions
          </Text>
          <View className="px-5">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={getActionClassName(action.primary)}
                style={action.primary 
                  ? { backgroundColor: primaryColor }
                  : { backgroundColor: cardColor, borderColor }
                }
                onPress={action.onPress}
              >
                <Ionicons 
                  name={action.icon as any} 
                  size={28} 
                  color={action.primary ? "white" : primaryColor} 
                  className="mb-2" 
                />
                <Text 
                  className={getTextClassName(action.primary)}
                  style={action.primary ? {} : { color: textColor }}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View 
          className="mx-5 rounded-2xl p-5 shadow-md border"
          style={{ backgroundColor: cardColor, borderColor }}
        >
          <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
            Recent Activity
          </Text>
          <View className="mt-4">
            <View className="flex-row items-center mb-4">
              <View 
                className="w-8 h-8 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: primaryColor }}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium mb-1" style={{ color: textColor }}>
                  Check-in completed
                </Text>
                <Text className="text-sm opacity-70" style={{ color: mutedColor }}>
                  2 hours ago
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: successColor }}
              >
                <Ionicons name="trophy" size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium mb-1" style={{ color: textColor }}>
                  Achievement unlocked
                </Text>
                <Text className="text-sm opacity-70" style={{ color: mutedColor }}>
                  Yesterday
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

