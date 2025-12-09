export const lightTheme = {
  primary: '#010066',      // primary: Malaysia navy blue
  secondary: '#E30613',    // secondary: Malaysia red
  accent: '#FFD700',       // accent: Malaysia yellow
  background: '#F9FAFB',   // background: iOS-style light gray
  card: '#FFFFFF',         // card: Pure white for cards
  text: '#1C1C1E',         // text: iOS-style dark text
  muted: '#8E8E93',       // muted: iOS-style gray for secondary text
  border: '#E5E5EA',       // border: iOS-style light border
  success: '#34C759',     // success: iOS green
  error: '#FF3B30',       // error: iOS red
  warning: '#FFCC00',     // warning: iOS yellow
};

export const darkTheme = {
  primary: '#4A90E2',      // primary: Lighter blue for better contrast in dark mode
  secondary: '#FF6B6B',    // secondary: Lighter red for better contrast in dark mode
  accent: '#FFD700',       // accent: Malaysia yellow (unchanged, good contrast)
  background: '#121212',   // background: Material dark gray instead of pure black
  card: '#1E1E1E',         // card: Slightly lighter than background for depth
  text: '#FFFFFF',         // text: Pure white for maximum contrast
  muted: '#AEAEB2',       // muted: Lighter gray for better visibility in dark mode
  border: '#333333',       // border: Subtle border that's visible but not harsh
  success: '#4CD964',     // success: Bright green for dark mode
  error: '#FF5252',       // error: Bright red for dark mode
  warning: '#FFC107',     // warning: Bright amber for dark mode
};

export type ThemeColors = typeof lightTheme;
export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};