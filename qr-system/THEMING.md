# Hybrid Theming System Documentation

This document explains the hybrid theming system implemented for the Expo React Native app, which combines NativeWind for layout with a custom React Context-based theming solution for colors.

## Overview

The theming system provides:
- Malaysian-inspired color palette with iOS design principles
- Dark and light mode support
- Persistent theme preferences using AsyncStorage
- Easy integration with existing NativeWind layout utilities
- Simple API for accessing theme colors throughout the app

## Architecture

### 1. Color Definitions (`constants/colors.ts`)

The color system is defined in `constants/colors.ts` with two theme variants:

#### Light Theme
- Clean, bright iOS-style neutral colors
- Malaysian flag-inspired accent colors (navy blue, red, yellow)
- Optimized for daylight viewing

#### Dark Theme
- Material Design-inspired dark backgrounds with better contrast
- Optimized colors for improved visibility in low-light conditions
- Enhanced text contrast for better readability

#### Color Palette
```typescript
// Light Theme
primary: '#010066'      // Malaysia navy blue
secondary: '#E30613'    // Malaysia red
accent: '#FFD700'       // Malaysia yellow
background: '#F9FAFB'   // iOS-style light gray
card: '#FFFFFF'         // Pure white for cards
text: '#1C1C1E'         // iOS-style dark text
muted: '#8E8E93'       // iOS-style gray for secondary text
border: '#E5E5EA'       // iOS-style light border
success: '#34C759'     // iOS green
error: '#FF3B30'       // iOS red
warning: '#FFCC00'     // iOS yellow

// Dark Theme
primary: '#4A90E2'      // Lighter blue for better contrast
secondary: '#FF6B6B'    // Lighter red for better contrast
accent: '#FFD700'       // Malaysia yellow (unchanged)
background: '#121212'   // Material dark gray
card: '#1E1E1E'         // Slightly lighter than background
text: '#FFFFFF'         // Pure white for maximum contrast
muted: '#AEAEB2'       // Lighter gray for better visibility
border: '#333333'       // Subtle but visible border
success: '#4CD964'     // Bright green
error: '#FF5252'       // Bright red
warning: '#FFC107'     // Bright amber
```

### 2. Theme Context (`context/ThemeContext.tsx`)

The ThemeContext provides:
- Theme state management (light/dark mode)
- Theme switching functionality
- Persistent storage of theme preferences
- Access to current theme and theme mode

#### API
```typescript
interface ThemeContextType {
  theme: ThemeColors;           // Current theme colors
  themeMode: ThemeMode;         // 'light' | 'dark'
  isSystemTheme: boolean;       // Whether following system theme
  toggleTheme: () => void;      // Switch between light/dark
  setThemeMode: (mode: ThemeMode) => void; // Set specific mode
  useSystemTheme: () => void;   // Follow device color scheme
}
```

### 3. Theme Hook (`hooks/useThemeColor.ts`)

A simple helper hook for accessing individual theme colors:
```typescript
const useThemeColor = (colorKey: keyof ThemeColors) => {
  const { theme } = useTheme();
  return theme[colorKey];
};
```

## Usage Examples

### Basic Component with Theme Colors

```tsx
import { Text, View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function MyComponent() {
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const accentColor = useThemeColor('accent');

  return (
    <View style={{ backgroundColor, padding: 20 }}>
      <Text style={{ color: textColor }}>Themed Text</Text>
      <View style={{ backgroundColor: accentColor, padding: 10 }}>
        <Text>Accent Color</Text>
      </View>
    </View>
  );
}
```

### Hybrid Approach with NativeWind

```tsx
import { Text, View, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";

export default function HybridComponent() {
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const { toggleTheme } = useTheme();

  return (
    // NativeWind for layout
    <View className="flex-1 items-center justify-center p-4">
      {/* Theme colors for styling */}
      <View 
        className="rounded-xl p-6 shadow-lg"
        style={{ backgroundColor: cardColor }}
      >
        <Text style={{ color: textColor }}>Themed Content</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Text>Toggle Theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### Theme Toggle Implementation

```tsx
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";

export const ThemeToggleButton = () => {
  const { themeMode, toggleTheme } = useTheme();
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{ borderColor, borderWidth: 1, padding: 10 }}
    >
      <Text style={{ color: textColor }}>
        Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
      </Text>
    </TouchableOpacity>
  );
};
```

## Integration Steps

1. **Wrap App with ThemeProvider**
   ```tsx
   // app/_layout.tsx
   import { ThemeProvider } from "@/context/ThemeContext";
   
   export default function RootLayout() {
     return (
       <ThemeProvider>
         <Stack />
       </ThemeProvider>
     );
   }
   ```

2. **Import and Use Theme Colors**
   ```tsx
   import { useThemeColor } from "@/hooks/useThemeColor";
   
   const backgroundColor = useThemeColor('background');
   ```

3. **Use NativeWind for Layout**
   ```tsx
   <View className="flex-1 items-center justify-center">
   ```

4. **Apply Theme Colors for Styling**
   ```tsx
   <View style={{ backgroundColor }}>
   ```

## Best Practices

1. **Layout vs. Colors**
   - Use NativeWind `className` for layout (flex, padding, margin, etc.)
   - Use theme colors for visual styling (backgrounds, text, borders)

2. **Consistent Color Usage**
   - Always use `useThemeColor()` for colors instead of hardcoded values
   - Follow semantic color naming (primary, secondary, accent, etc.)

3. **Theme Switching**
   - Provide clear UI indicators for current theme mode
   - Make theme toggle easily accessible
   - Consider system theme detection for automatic switching

4. **Performance**
   - The theme context is optimized to prevent unnecessary re-renders
   - Theme colors are memoized and only update when theme changes

## File Structure

```
qr-system/
├── constants/
│   └── colors.ts           # Theme color definitions
├── context/
│   └── ThemeContext.tsx    # Theme provider and context
├── hooks/
│   └── useThemeColor.ts    # Helper hook for colors
└── app/
    ├── _layout.tsx         # App wrapper with ThemeProvider
    └── index.tsx           # Example implementation
```

## Dependencies

- `@react-native-async-storage/async-storage` - For persisting theme preferences
- `nativewind` - For layout utilities (already installed)
- `react` - For context and hooks (already installed)

## Future Enhancements

1. **System Theme Detection**
   - Automatically detect and apply system light/dark mode
   - Respect user's device preferences

2. **Additional Themes**
   - Add more theme variants (e.g., high contrast, custom themes)
   - Theme customization options

3. **Animation Support**
   - Smooth transitions between theme changes
   - Animated theme switching

4. **Theme Builder**
   - Dynamic theme generation
   - Runtime color customization

## Troubleshooting

### Common Issues

1. **Theme Not Applying**
   - Ensure component is wrapped in ThemeProvider
   - Check that useThemeColor is imported correctly

2. **Theme Not Persisting**
   - Verify AsyncStorage is properly installed
   - Check console for storage errors

3. **TypeScript Errors**
   - Ensure all imports are correct
   - Check that ThemeColors type is properly exported

### Debug Tips

1. Add console logs to verify theme changes:
   ```tsx
   const { themeMode, toggleTheme } = useTheme();
   console.log('Current theme:', themeMode);
   ```

2. Check AsyncStorage contents:
   ```tsx
   AsyncStorage.getItem('app_theme_mode').then(console.log);
   ```

3. Verify theme context is available:
   ```tsx
   const context = useTheme();
   console.log('Theme context:', context);