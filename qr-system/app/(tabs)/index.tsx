import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Ionicons } from "@expo/vector-icons";
import { studentApi } from "@/api/studentApi";
import { ParentOnly } from "@/components/RoleBasedUI";

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

  // Parent-specific children data (placeholder)
  const childrenData = [
    { name: "Ahmad", grade: "5A", attendance: "Present", lastSeen: "2 hours ago" },
    { name: "Siti", grade: "3B", attendance: "Present", lastSeen: "1 hour ago" },
  ];

  // Logout handler function
  const handleLogout = async () => {
    await logout();
    router.replace("/(onboarding)");
  };

  // Quick actions for different roles
  const getQuickActions = () => {
    const baseActions = [
      {
        title: "Log Out",
        icon: "log-out-outline",
        onPress: handleLogout,
        primary: false
      }
    ];

    // Only add scan action for admin/teacher
    if (role === 'admin' || role === 'teacher') {
      baseActions.unshift({
        title: "Scan QR Code",
        icon: "qr-code-outline",
        onPress: async () => router.push("/scanner"),
        primary: true
      });
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

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
        {/* <View className="mb-8">
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
        </View> */}

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

        {/* Parent-specific Children View */}
        <ParentOnly>
          <View
            className="mx-5 rounded-2xl p-5 shadow-md border mb-6"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
              My Children
            </Text>
            <View className="mt-4">
              {childrenData.map((child, index) => (
                <View key={index} className="flex-row items-center mb-4 p-3 rounded-xl" style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}>
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center mr-3"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Text className="text-white font-bold">{child.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1" style={{ color: textColor }}>
                      {child.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-sm mr-3" style={{ color: mutedColor }}>
                        Grade {child.grade}
                      </Text>
                      <View
                        className="px-2 py-1 rounded-full mr-2"
                        style={{ backgroundColor: successColor }}
                      >
                        <Text className="text-xs text-white font-medium">
                          {child.attendance}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs opacity-70" style={{ color: mutedColor }}>
                      Last seen: {child.lastSeen}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="p-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                    onPress={() => router.push(`/student-details?studentId=${child.name.toLowerCase()}`)}
                  >
                    <Ionicons name="chevron-forward" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ParentOnly>

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

