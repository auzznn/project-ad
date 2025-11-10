import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeShowcase() {
  const { theme, themeMode, toggleTheme } = useTheme();
  
  // Get all theme colors
  const colors = {
    primary: useThemeColor('primary'),
    secondary: useThemeColor('secondary'),
    accent: useThemeColor('accent'),
    background: useThemeColor('background'),
    card: useThemeColor('card'),
    text: useThemeColor('text'),
    muted: useThemeColor('muted'),
    border: useThemeColor('border'),
    success: useThemeColor('success'),
    error: useThemeColor('error'),
    warning: useThemeColor('warning'),
  };

  const ColorBox = ({ name, color }: { name: string; color: string }) => (
    <View style={[styles.colorContainer, { backgroundColor: color }]}>
      <Text style={[styles.colorName, { color: name === 'background' || name === 'card' ? colors.text : '#FFFFFF' }]}>
        {name}
      </Text>
      <Text style={[styles.colorValue, { color: name === 'background' || name === 'card' ? colors.text : '#FFFFFF' }]}>
        {color}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Theme Showcase</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Current Theme: {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Brand Colors</Text>
        <View style={styles.colorGrid}>
          <ColorBox name="primary" color={colors.primary} />
          <ColorBox name="secondary" color={colors.secondary} />
          <ColorBox name="accent" color={colors.accent} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Surface Colors</Text>
        <View style={styles.colorGrid}>
          <ColorBox name="background" color={colors.background} />
          <ColorBox name="card" color={colors.card} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Text Colors</Text>
        <View style={styles.colorGrid}>
          <ColorBox name="text" color={colors.text} />
          <ColorBox name="muted" color={colors.muted} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Status Colors</Text>
        <View style={styles.colorGrid}>
          <ColorBox name="success" color={colors.success} />
          <ColorBox name="error" color={colors.error} />
          <ColorBox name="warning" color={colors.warning} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Other Colors</Text>
        <View style={styles.colorGrid}>
          <ColorBox name="border" color={colors.border} />
        </View>
      </View>

      <View style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.demoTitle, { color: colors.text }]}>Demo Card</Text>
        <Text style={[styles.demoText, { color: colors.muted }]}>
          This is how a card looks with the current theme. The border and text colors automatically adapt to the theme.
        </Text>
        <View style={styles.buttonContainer}>
          <View style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Primary Button</Text>
          </View>
          <View style={[styles.button, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Secondary Button</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorContainer: {
    width: '48%',
    height: 100,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 12,
    opacity: 0.8,
  },
  demoCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});