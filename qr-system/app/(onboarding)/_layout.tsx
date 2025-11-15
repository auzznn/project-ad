import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
export default function OnboardingLayout() {

  const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return null;
if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      </Stack>
  );
}