import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { studentApi } from "@/api/studentApi";
import { ParentOnly } from "@/components/RoleBasedUI";

export default function TabIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [originalChildren, setOriginalChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const greeting = getGreeting();

  // Get theme colors
  const backgroundColor = useThemeColor("background");
  const cardColor = useThemeColor("card");
  const textColor = useThemeColor("text");
  const mutedColor = useThemeColor("muted");
  const primaryColor = useThemeColor("primary");
  const secondaryColor = useThemeColor("secondary");
  const accentColor = useThemeColor("accent");
  const borderColor = useThemeColor("border");
  const successColor = useThemeColor("success");
  const warningColor = useThemeColor("warning");

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
        const attendanceData =
          await studentApi.checkChildrenAttendance(childrenIds);
        console.log("attendance data", attendanceData);
        // Transform the data to match the expected structure
        const transformedChildren = children.map((child: any) => {
          // Find attendance data for this child
          const childAttendance = attendanceData.find(
            (attendance: any) => attendance.studentId === child.id
          );

          console.log("child attendace", childAttendance);

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
    }
  }, [user?.user_id, user?.role]);

  // Fetch children data when component mounts
  useEffect(() => {
    fetchChildrenData();
  }, [fetchChildrenData]);

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
    <SafeAreaView
      className="flex-1 pt-6"
      edges={["top"]}
      style={{ backgroundColor }}
    >
      {/* Header Section - Fixed */}
      <View
        className="px-5 pt-5 pb-8"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text
              className="text-4xl font-bold mb-1"
              style={{ color: primaryColor }}
            >
              {greeting},
            </Text>
            <Text
              className="text-4xl font-bold mb-1"
              style={{ color: primaryColor }}
            >
              {user?.first_name} {user?.last_name}!
            </Text>
            <Text className="text-base" style={{ color: mutedColor }}>
              Welcome back to your dashboard
            </Text>
          </View>
        </View>
      </View>

      {/* Header/Body Separator - Fixed */}
      <View className="mx-5 mb-6" style={{ backgroundColor: borderColor }} />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {/* Quick Actions */}
        {quickActions.length > 0 && (
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
                      ? { backgroundColor: accentColor }
                      : { backgroundColor: cardColor, borderColor }
                  }
                  onPress={action.onPress}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={28}
                    color={action.primary ? "white" : secondaryColor}
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
        )}

        {/* Parent-specific Children View */}
        <ParentOnly>
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4 px-5">
              <Text
                className="text-xl font-semibold"
                style={{ color: textColor }}
              >
                My Children
              </Text>
              <TouchableOpacity
                className="p-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
                onPress={fetchChildrenData}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <View
              className="mx-5 rounded-2xl shadow-sm border overflow-hidden"
              style={{ backgroundColor: backgroundColor, borderColor }}
            >
              <ScrollView
                className="p-3"
                horizontal={false}
                showsVerticalScrollIndicator={true}
                style={{ maxHeight: 500 }}
              >
                {loading ? (
                  <Text
                    className="text-center py-4"
                    style={{ color: mutedColor }}
                  >
                    Loading children data...
                  </Text>
                ) : childrenData.length > 0 ? (
                  childrenData.map((child, index) => (
                    <TouchableOpacity
                      key={index}
                      className="rounded-2xl p-5 mb-3 items-center shadow-sm border"
                      style={{ backgroundColor: cardColor, borderColor }}
                      onPress={() => {
                        router.push(`/student-details?studentId=${child.id}`);
                      }}
                    >
                      <View className="w-full">
                        <View className="flex-row items-center mb-3">
                          <View
                            className="w-12 h-12 rounded-full justify-center items-center mr-3"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <Text className="text-white font-bold">
                              {child.name.charAt(0)}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-base font-semibold"
                              style={{ color: textColor }}
                            >
                              {child.name}
                            </Text>
                            <Text
                              className="text-sm"
                              style={{ color: mutedColor }}
                            >
                              Class: {child.grade}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{
                              backgroundColor:
                                child.attendance === "on-time"
                                  ? successColor
                                  : child.attendance === "late"
                                    ? secondaryColor
                                    : warningColor,
                            }}
                          >
                            <Text className="text-xs text-white font-medium">
                              {child.attendance}
                            </Text>
                          </View>
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: mutedColor }}
                          >
                            Last seen: {child.lastSeen}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text
                    className="text-center py-4"
                    style={{ color: mutedColor }}
                  >
                    No children data available
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </ParentOnly>

        {/* Recent Activity */}
      </ScrollView>
    </SafeAreaView>
  );
}
