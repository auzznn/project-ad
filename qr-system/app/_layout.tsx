import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext";
import "../global.css"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
