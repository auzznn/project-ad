import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
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
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const renderIndicator = () => {
    return (
      <View className="flex-row justify-center items-center my-8">
        {onboardingData.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentIndex ? 'w-6' : 'w-2'
            }`}
            style={{
              backgroundColor: index === currentIndex ? primaryColor : mutedColor,
            }}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ width: screenWidth, backgroundColor }}
      >
        <View className="px-10 items-center">
          <View className="w-30 h-30 rounded-full justify-center items-center mb-10">
            <Text className="text-6xl">{item.icon}</Text>
          </View>
          
          <Text
            className="text-3xl font-bold text-center mb-5"
            style={{ color: textColor }}
          >
            {item.title}
          </Text>
          
          <Text
            className="text-base text-center leading-6"
            style={{ color: mutedColor }}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <View className="flex-1">
        {/* Skip button */}
        <View className="flex-row justify-end px-5 pt-3">
          <TouchableOpacity onPress={handleSkip}>
            <Text
              className="text-base font-medium"
              style={{ color: mutedColor }}
            >
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
        <View className="px-5 pb-8">
          {currentIndex < onboardingData.length - 1 ? (
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="py-4 px-6 rounded-xl items-center justify-center min-w-30 border-2"
                style={{ borderColor: primaryColor, backgroundColor: 'transparent' }}
                onPress={handleSkip}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: primaryColor }}
                >
                  Skip
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="py-4 px-6 rounded-xl items-center justify-center flex-1 ml-3"
                style={{ backgroundColor: primaryColor }}
                onPress={handleNext}
              >
                <Text
                  className="text-base font-semibold text-white"
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="py-4 rounded-xl items-center justify-center w-full"
              style={{ backgroundColor: primaryColor }}
              onPress={handleGetStarted}
            >
              <Text
                className="text-base font-semibold text-white"
              >
                Get Started
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});