import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to SK Sri Siakap',
    description: 'A modern QR-based system designed to streamline school operations and enhance communication between teachers, guardians, and students.',
    icon: '🏫',
  },
  {
    id: '2',
    title: 'QR-Based Attendance',
    description: 'Quickly mark attendance with our efficient QR code system. Reduce paperwork and save valuable classroom time.',
    icon: '📱',
  },
  {
    id: '3',
    title: 'Real-time Updates',
    description: 'Stay informed with instant notifications about student activities, events, and important announcements.',
    icon: '🔔',
  },
  {
    id: '4',
    title: 'Easy Communication',
    description: 'Connect seamlessly between teachers and guardians. Track progress, share updates, and collaborate for student success.',
    icon: '💬',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const accentColor = useThemeColor('accent');
  const mutedColor = useThemeColor('muted');
  const cardColor = useThemeColor('card');
  const { themeMode } = useTheme();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const handleGetStarted = () => {
    router.replace('/login');
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const renderIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? primaryColor : mutedColor,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
    return (
      <View style={[styles.slide, { width: screenWidth, backgroundColor }]}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          
          <Text style={[styles.title, { color: textColor }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.description, { color: mutedColor }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <View style={styles.container}>
        {/* Skip button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: mutedColor }]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Onboarding slides */}
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(item) => item.id}
        />

        {/* Indicators */}
        {renderIndicator()}

        {/* Action buttons */}
        <View style={styles.footer}>
          {currentIndex < onboardingData.length - 1 ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: primaryColor, backgroundColor: 'transparent' },
                ]}
                onPress={handleSkip}
              >
                <Text style={[styles.buttonText, { color: primaryColor }]}>
                  Skip
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: primaryColor },
                ]}
                onPress={handleNext}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.getStartedButton,
                { backgroundColor: primaryColor },
              ]}
              onPress={handleGetStarted}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Get Started
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  primaryButton: {
    flex: 1,
    marginLeft: 10,
  },
  getStartedButton: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});