import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import "../global.css"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="_entry"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
