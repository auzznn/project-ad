import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const { isAuthenticated, user } = useAuth();
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [originalChildren, setOriginalChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Using placeholder username as requested

  // Get theme colors
  const backgroundColor = useThemeColor("background");
  const cardColor = useThemeColor("card");
  const textColor = useThemeColor("text");
  const mutedColor = useThemeColor("muted");
  const primaryColor = useThemeColor("primary");
  const borderColor = useThemeColor("border");
  const successColor = useThemeColor("success");

  // Fetch children data when component mounts
  const fetchChildrenData = useCallback(async () => {
    try {
      if (user?.user_id && user.role === "parent") {
        const children = await studentApi.getChildren(user.user_id);
        
        // Store original children data with IDs
        setOriginalChildren(children);
        
        // Get all children IDs for batch attendance check
        const childrenIds = children.map((child: any) => child.id);

        
        // Check attendance status for all children at once
        const attendanceData = await studentApi.checkChildrenAttendance(childrenIds);
        console.log("attendance data", attendanceData)
        // Transform the data to match the expected structure
        const transformedChildren = children.map((child: any) => {
          // Find attendance data for this child
          const childAttendance = attendanceData.find((attendance: any) =>
            attendance.studentId === child.id
          );

          console.log("child attendace", childAttendance)
          
          return {
            id: child.id, // Keep the ID for navigation
            name: child.username || child.name || "Unknown",
            grade:
              child.grade && child.section
                ? `${child.grade} ${child.section}`
                : child.grade || child.section || "N/A",
            attendance: childAttendance.status,
            lastSeen: childAttendance?.timestamp
              ? new Date(childAttendance.timestamp).toLocaleString()
              : "No record today",
          };
        });
        
        setChildrenData(transformedChildren);
      } else {
        // Not a parent or no user_id, set empty array
        setChildrenData([]);
        setOriginalChildren([]);
      }
    } catch (error) {
      console.error("Error fetching children data:", error);
      // Set empty array on error to prevent crashes
      setChildrenData([]);
      setOriginalChildren([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.user_id, user?.role]);

  // Fetch children data when component mounts
  useEffect(() => {
    fetchChildrenData();
  }, [fetchChildrenData]);

  // Function to handle manual refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChildrenData();
  }, []);

  // Quick stats data (placeholder)

  // Quick actions for different roles
  const getQuickActions = () => {
    const baseActions = [];

    // Only add scan action for admin/teacher
    if (user?.role === "admin" || user?.role === "teacher") {
      baseActions.push({
        title: "Scan QR Code",
        icon: "qr-code-outline",
        onPress: async () => router.push("/scanner"),
        primary: true,
      });
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const getActionClassName = (primary: boolean) => {
    return `rounded-2xl p-5 mb-3 items-center shadow-sm ${primary ? "border-0" : "border"}`;
  };

  const getTextClassName = (primary: boolean) => {
    return `text-base font-semibold text-center${primary ? " text-white" : ""}`;
  };

  return (
    <SafeAreaView className="flex-1 pt-8" style={{ backgroundColor }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {/* Header Section */}
        <View className="px-5 pt-5 pb-8">
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full justify-center items-center mr-4 shadow-sm border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-3xl font-semibold mb-1"
                style={{ color: textColor }}
              >
                Hey, {user?.first_name} {user?.last_name} 👋
              </Text>
              <Text
                className="text-base opacity-80"
                style={{ color: mutedColor }}
              >
                Welcome back to your dashboard
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text
            className="text-xl font-semibold mb-4 px-5"
            style={{ color: textColor }}
          >
            Quick Actions
          </Text>
          <View className="px-5">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={getActionClassName(action.primary)}
                style={
                  action.primary
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
            className="mx-5 rounded-2xl p-5 shadow-sm border mb-6"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className="text-xl font-semibold"
                style={{ color: textColor }}
              >
                My Children
              </Text>
              <TouchableOpacity
                className="p-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
                onPress={handleRefresh}
                disabled={refreshing}
              >
                <Ionicons
                  name={refreshing ? "sync" : "refresh"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <View className="mt-4">
              {loading ? (
                <Text
                  className="text-center py-4"
                  style={{ color: mutedColor }}
                >
                  Loading children data...
                </Text>
              ) : childrenData.length > 0 ? (
                childrenData.map((child, index) => (
                  <View
                    key={index}
                    className="flex-row items-center mb-4 p-3 rounded-xl"
                    style={{
                      backgroundColor: cardColor,
                      borderColor,
                      borderWidth: 1,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-full justify-center items-center mr-3"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Text className="text-white font-bold">
                        {child.name.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-semibold mb-1"
                        style={{ color: textColor }}
                      >
                        {child.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text
                          className="text-sm mr-3"
                          style={{ color: mutedColor }}
                        >
                          Class: {child.grade}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              child.attendance === "on-time"
                                ? successColor
                                : child.attendance === "late"
                                  ? "#ef4444"
                                  : "#f59e0b",
                          }}
                        >
                          <Text className="text-xs text-white font-medium">
                            {child.attendance}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="text-xs opacity-70"
                        style={{ color: mutedColor }}
                      >
                        Last seen: {child.lastSeen}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="p-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                      onPress={() => {
                        // Use the child's ID directly from the transformed data
                        router.push(`/student-details?studentId=${child.id}`);
                      }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text
                  className="text-center py-4"
                  style={{ color: mutedColor }}
                >
                  No children data available
                </Text>
              )}
            </View>
          </View>
        </ParentOnly>

        {/* Recent Activity */}

      </ScrollView>
    </SafeAreaView>
  );
}
