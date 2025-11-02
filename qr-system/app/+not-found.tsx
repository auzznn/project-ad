import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, redirect to tabs
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  // Otherwise, redirect to onboarding
  return <Redirect href="/(onboarding)" />;
}