import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="_entry"
        >
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{
              presentation: "modal",
              headerShown: false,
              gestureEnabled: true,
              animation: "slide_from_bottom",
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
            <Stack.Screen
            name="scanner"
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />

        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
