import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Onboarding data with vector icons and colors
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to EduQR',
    description: 'A modern QR-based system designed to streamline school operations and enhance communication between teachers, guardians, and students.',
    icon: 'school-outline',
    color: '#4A90E2',
  },
  {
    id: '2',
    title: 'QR-Based Attendance',
    description: 'Quickly mark attendance with our efficient QR code system. Reduce paperwork and save valuable classroom time.',
    icon: 'qr-code-outline',
    color: '#FF6B6B',
  },
  {
    id: '3',
    title: 'Real-time Updates',
    description: 'Stay informed with instant notifications about student activities, events, and important announcements.',
    icon: 'notifications-outline',
    color: '#4CD964',
  },
  {
    id: '4',
    title: 'Easy Communication',
    description: 'Connect seamlessly between teachers and guardians. Track progress, share updates, and collaborate for student success.',
    icon: 'chatbubble-ellipses-outline',
    color: '#FFCC00',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');
  const accentColor = useThemeColor('accent');
  const mutedColor = useThemeColor('muted');
  const cardColor = useThemeColor('card');
  const { themeMode } = useTheme();

  // Animated values for button transitions
  const backOpacity = useRef(new Animated.Value(currentIndex === 0 ? 0 : 1)).current;
  const nextOpacity = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;
  const getStartedOpacity = useRef(new Animated.Value(0)).current;
  const getStartedScale = useRef(new Animated.Value(0.8)).current;

  // Animate buttons when index changes
  React.useEffect(() => {
    const isFirstScreen = currentIndex === 0;
    const isLastScreen = currentIndex === onboardingData.length - 1;
    
    Animated.parallel([
      Animated.timing(backOpacity, {
        toValue: isFirstScreen ? 0 : 1, // Show back button on all pages except first
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nextOpacity, {
        toValue: isLastScreen ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nextScale, {
        toValue: isLastScreen ? 0.8 : 1,
        duration: isFirstScreen ? 500 : 300, // Longer duration for first->second transition
        useNativeDriver: true,
      }),
      Animated.timing(getStartedOpacity, {
        toValue: isLastScreen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(getStartedScale, {
        toValue: isLastScreen ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    }
  };

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentIndex(index);
      },
    }
  );

  const renderIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: primaryColor,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: typeof onboardingData[0]; index: number }) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width: screenWidth, backgroundColor }]}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={80} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: textColor }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.description, { color: mutedColor }]}>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Top navigation bar - positioned within safe area */}
      <View style={styles.topNavigationContainer}>
        {/* Back button - show from second screen onwards including last page */}
        {currentIndex > 0 && (
          <Animated.View
            style={[
              styles.topBackButtonContainer,
              {
                opacity: backOpacity,
              }
            ]}
          >
            <TouchableOpacity
              onPress={handleBack}
            >
              <Text style={[styles.skipButtonText, { color: mutedColor }]}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      
      {/* Skip button - positioned outside the navigation container to ensure visibility */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={[styles.skipButtonText, { color: mutedColor }]}>Skip</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.slidesContainer}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View style={styles.bottomContainer}>
        {renderIndicator()}

        <View style={styles.buttonContainer}>
          {currentIndex === onboardingData.length - 1 ? (
            // Last screen: Full width Get Started button
            <Animated.View
              style={[
                styles.fullWidthButtonContainer,
                {
                  opacity: getStartedOpacity,
                  transform: [{ scale: getStartedScale }]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.getStartedButton, { backgroundColor: primaryColor }]}
                onPress={handleGetStarted}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // All other screens: Full width Next button
            <Animated.View
              style={[
                styles.fullWidthButtonContainer,
                {
                  opacity: nextOpacity,
                  transform: [{ scale: nextScale }]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: primaryColor }]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Needed for absolute positioning of skip button
  },
  topNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10, // Reduced padding since it's now within safe area
    position: 'relative', // Needed for absolute positioning of skip button
  },
  topBackButtonContainer: {
    opacity: 1,
  },
  topBackButton: {
    borderWidth: 2,
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    top: 50, // Adjusted to align with back button, accounting for safe area
    zIndex: 10, // Higher z-index to ensure it's above all other elements
    backgroundColor: 'transparent', // Ensure background is transparent
    padding: 5, // Add some padding for better touch area
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthButtonContainer: {
    width: '100%',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    marginTop: 10,
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: 8,
  },
  getStartedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    height: 56,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    height: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});