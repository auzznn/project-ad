import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ThemePage() {
  const { theme, themeMode, toggleTheme, setThemeMode, isSystemTheme, useSystemTheme } = useTheme();
  
  // Get theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');

  const handleSystemThemeToggle = () => {
    if (isSystemTheme) {
      // Switch to manual mode with current theme
      setThemeMode(themeMode);
    } else {
      // Switch to system theme
      useSystemTheme();
    }
  };

  const handleManualThemeToggle = () => {
    if (!isSystemTheme) {
      toggleTheme();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Theme Settings
          </Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Choose your preferred theme mode
          </Text>
        </View>

        {/* System Theme Toggle */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="phone-portrait" 
                size={24} 
                color={primaryColor} 
                style={styles.icon} 
              />
              <View style={styles.textContainer}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Use System Theme
                </Text>
                <Text style={[styles.settingDescription, { color: mutedColor }]}>
                  Automatically follow device's appearance settings
                </Text>
              </View>
            </View>
            <Switch
              value={isSystemTheme}
              onValueChange={handleSystemThemeToggle}
              trackColor={{ false: borderColor, true: primaryColor }}
              thumbColor={isSystemTheme ? primaryColor : textColor}
              ios_backgroundColor={cardColor}
            />
          </View>
        </View>

        {/* Manual Theme Selection */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="color-palette" 
                size={24} 
                color={isSystemTheme ? mutedColor : primaryColor} 
                style={styles.icon} 
              />
              <View style={styles.textContainer}>
                <Text style={[
                  styles.settingTitle, 
                  { color: isSystemTheme ? mutedColor : textColor }
                ]}>
                  Manual Theme
                </Text>
                <Text style={[styles.settingDescription, { color: mutedColor }]}>
                  {isSystemTheme 
                    ? "Enable manual mode to select theme" 
                    : `Currently using ${themeMode} mode`
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={!isSystemTheme}
              onValueChange={() => setThemeMode(themeMode)}
              trackColor={{ false: borderColor, true: primaryColor }}
              thumbColor={!isSystemTheme ? primaryColor : mutedColor}
              ios_backgroundColor={cardColor}
              disabled={isSystemTheme}
            />
          </View>
        </View>

        {/* Theme Toggle Button */}
        {!isSystemTheme && (
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: primaryColor }]}
            onPress={handleManualThemeToggle}
          >
            <Ionicons 
              name={themeMode === 'light' ? 'moon' : 'sunny'} 
              size={20} 
              color="white" 
              style={styles.buttonIcon} 
            />
            <Text style={styles.buttonText}>
              Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
            </Text>
          </TouchableOpacity>
        )}

        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.statusText, { color: textColor }]}>
            Current Status
          </Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: mutedColor }]}>
              Mode:
            </Text>
            <Text style={[styles.statusValue, { color: primaryColor }]}>
              {isSystemTheme ? 'System' : 'Manual'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: mutedColor }]}>
              Theme:
            </Text>
            <Text style={[styles.statusValue, { color: primaryColor }]}>
              {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});