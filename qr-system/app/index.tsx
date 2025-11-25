import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useRef } from "react";

export default function EntryScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const backgroundColor = useThemeColor("background");
  const textColor = useThemeColor("text");

  const hasNavigated = useRef(false); // prevent double navigation

  console.log("EntryScreen render →", { isLoading, isAuthenticated, user });

  useEffect(() => {
    if (isLoading) {
      console.log("Auth still loading...");
      return;
    }

    if (hasNavigated.current) return; // stop double nav
    hasNavigated.current = true;

    console.log("Auth resolved. Navigating...");

    if (isAuthenticated) {
      console.log("→ Redirect to (tabs)");
      router.replace("/(tabs)");
    } else {
      console.log("→ Redirect to (onboarding)");
      router.replace("/(onboarding)");
    }
  }, [isLoading, isAuthenticated]);

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ backgroundColor }}
        className="flex-1 items-center justify-center"
      >
        <View className="items-center">
          <ActivityIndicator size="large" color={textColor} />
          <Text className="mt-4 text-lg" style={{ color: textColor }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Backup screen (should rarely flash)
  return (
    <SafeAreaView
      style={{ backgroundColor }}
      className="flex-1 items-center justify-center"
    >
      <View className="items-center">
        <ActivityIndicator size="large" color={textColor} />
        <Text className="mt-4 text-lg" style={{ color: textColor }}>
          Redirecting...
        </Text>
      </View>
    </SafeAreaView>
  );
}
