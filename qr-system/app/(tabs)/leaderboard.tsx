import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// Dynamic student data structure
interface StudentData {
  id: number;
  student_id: string;
  name: string;
  grade: string;
  class: string;
  points: number;
}

const grades = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
const classes = ['All Classes', 'Class A', 'Class B', 'Class C'];

export default function Leaderboard() {
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('accent');
  const successColor = useThemeColor('success');
  
  // Load student data from AsyncStorage on component mount
  useEffect(() => {
    loadStudentData();
  }, []);
  
  /**
   * Refresh data when the screen is focused (after navigating back from other tabs)
   * This ensures the leaderboard always shows the latest data after:
   * - Recording new good deeds in scanner
   * - Adding new students
   * - Manual refresh via refresh button
   *
   * useFocusEffect from expo-router ensures this runs every time the tab becomes active
   */
  useFocusEffect(
    React.useCallback(() => {
      loadStudentData();
    }, [])
  );
  
  const loadStudentData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's deeds first to get the most recent student activities
      const todayDeedsKey = `today_deeds_${today}`;
      const todayDeedsData = await AsyncStorage.getItem(todayDeedsKey);
      
      // Also load all student points to ensure we have complete data
      const allKeys = await AsyncStorage.getAllKeys();
      const studentPointKeys = allKeys.filter(key => key.startsWith('student_points_'));
      
      const uniqueStudents: { [key: string]: StudentData } = {};
      
      // Process today's deeds to get recent student activities
      if (todayDeedsData) {
        const todayDeeds = JSON.parse(todayDeedsData);
        
        todayDeeds.forEach((deed: any) => {
          if (!uniqueStudents[deed.studentId]) {
            uniqueStudents[deed.studentId] = {
              id: Object.keys(uniqueStudents).length + 1,
              student_id: deed.studentId,
              name: deed.studentName || `Student ${deed.studentId}`,
              grade: 'Unknown', // Default grade since not available in deed data
              class: deed.program || 'Unknown',
              points: 0
            };
          }
        });
      }
      
      // Process all student points to ensure complete data coverage
      for (const key of studentPointKeys) {
        const studentId = key.replace('student_points_', '');
        const pointsData = await AsyncStorage.getItem(key);
        
        if (pointsData) {
          const parsedData = JSON.parse(pointsData);
          
          // Only include students with points > 0
          if (parsedData.totalPoints > 0) {
            // If student not in uniqueStudents yet, add them
            if (!uniqueStudents[studentId]) {
              uniqueStudents[studentId] = {
                id: Object.keys(uniqueStudents).length + 1,
                student_id: studentId,
                name: `Student ${studentId}`,
                grade: 'Unknown',
                class: 'Unknown',
                points: 0
              };
            }
            
            // Update the points
            uniqueStudents[studentId].points = parsedData.totalPoints;
            
            // Try to get more detailed student info from sahsiah records
            const sahsiahKeys = allKeys.filter(key => key.startsWith('sahsiah_') && key.includes(studentId));
            
            for (const sahsiahKey of sahsiahKeys) {
              const sahsiahData = await AsyncStorage.getItem(sahsiahKey);
              if (sahsiahData) {
                const parsedSahsiah = JSON.parse(sahsiahData);
                if (parsedSahsiah.student_name && uniqueStudents[studentId].name === `Student ${studentId}`) {
                  uniqueStudents[studentId].name = parsedSahsiah.student_name;
                }
                if (parsedSahsiah.program && uniqueStudents[studentId].class === 'Unknown') {
                  uniqueStudents[studentId].class = parsedSahsiah.program;
                }
              }
            }
          }
        }
      }
      
      // Convert to array and sort by points (descending)
      const studentsArray = Object.values(uniqueStudents).sort((a, b) => b.points - a.points);
      
      console.log(`Loaded ${studentsArray.length} students for leaderboard`);
      setStudents(studentsArray);
      
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter(student =>
        (selectedGrade === 'All Grades' || student.grade === selectedGrade) &&
        (selectedClass === 'All Classes' || student.class === selectedClass)
      )
      .sort((a, b) => b.points - a.points);
  }, [students, selectedGrade, selectedClass]);
  
  // Get rank badge color based on position
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return accentColor; // Gold for 1st place
      case 2:
        return borderColor; // Silver for 2nd place
      case 3:
        return successColor; // Bronze for 3rd place
      default:
        return primaryColor;
    }
  };
  
  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'trophy';
      case 2:
        return 'medal';
      case 3:
        return 'ribbon';
      default:
        return 'star-outline';
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-5 pt-5 pb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
                Leaderboard
              </Text>
              <Text className="text-base" style={{ color: mutedColor }}>
                Top performing students this month
              </Text>
            </View>
            <TouchableOpacity
              className="p-3 rounded-full"
              style={{ backgroundColor: cardColor }}
              onPress={loadStudentData}
            >
              <Ionicons name="refresh" size={20} color={primaryColor} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filters */}
        <View className="px-5 mb-6">
          <View className="flex-row space-x-3">
            {/* Grade Filter */}
            <View className="flex-1">
              <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                Grade
              </Text>
              <TouchableOpacity
                className="rounded-xl border px-4 py-3 flex-row items-center justify-between"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => setGradeDropdownOpen(true)}
              >
                <Text className="text-base" style={{ color: textColor }}>
                  {selectedGrade}
                </Text>
                <Ionicons name="chevron-down" size={16} color={mutedColor} />
              </TouchableOpacity>
            </View>
            
            {/* Class Filter */}
            <View className="flex-1">
              <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                Class
              </Text>
              <TouchableOpacity
                className="rounded-xl border px-4 py-3 flex-row items-center justify-between"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => setClassDropdownOpen(true)}
              >
                <Text className="text-base" style={{ color: textColor }}>
                  {selectedClass}
                </Text>
                <Ionicons name="chevron-down" size={16} color={mutedColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Leaderboard List */}
        <View className="px-5">
          {loading ? (
            <View
              className="rounded-2xl p-8 items-center justify-center"
              style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
            >
              <Ionicons name="refresh" size={40} color={mutedColor} />
              <Text className="text-base mt-3 text-center" style={{ color: mutedColor }}>
                Loading leaderboard data...
              </Text>
            </View>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => {
              const rank = index + 1;
              return (
                <View
                  key={student.id}
                  className="rounded-2xl p-4 mb-3 border shadow-sm"
                  style={{
                    backgroundColor: cardColor,
                    borderColor,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center">
                    {/* Rank Badge */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: getRankBadgeColor(rank) }}
                    >
                      <Ionicons
                        name={getRankIcon(rank) as any}
                        size={18}
                        color="white"
                      />
                    </View>
                    
                    {/* Student Info */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: textColor }}>
                        {student.name}
                      </Text>
                      <View className="flex-row mt-1">
                        <Text className="text-sm" style={{ color: mutedColor }}>
                          {student.grade} • {student.class}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Points */}
                    <View className="items-end">
                      <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                        {student.points}
                      </Text>
                      <Text className="text-xs" style={{ color: mutedColor }}>
                        points
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View
              className="rounded-2xl p-8 items-center justify-center"
              style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
            >
              <Ionicons name="search" size={40} color={mutedColor} />
              <Text className="text-base mt-3 text-center" style={{ color: mutedColor }}>
                No students found with the selected filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Grade Dropdown Modal */}
      <Modal
        transparent={true}
        visible={gradeDropdownOpen}
        animationType="fade"
        onRequestClose={() => setGradeDropdownOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setGradeDropdownOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-5">
            <View
              className="rounded-2xl p-4 w-full max-h-[80%]"
              style={{ backgroundColor: cardColor }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold" style={{ color: textColor }}>
                  Select Grade
                </Text>
                <TouchableOpacity onPress={() => setGradeDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color={mutedColor} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={grades}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 px-2 border-b"
                    style={{ borderColor }}
                    onPress={() => {
                      setSelectedGrade(item);
                      setGradeDropdownOpen(false);
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{
                        color: selectedGrade === item ? primaryColor : textColor,
                        fontWeight: selectedGrade === item ? '600' : '400'
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Class Dropdown Modal */}
      <Modal
        transparent={true}
        visible={classDropdownOpen}
        animationType="fade"
        onRequestClose={() => setClassDropdownOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setClassDropdownOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-5">
            <View
              className="rounded-2xl p-4 w-full max-h-[80%]"
              style={{ backgroundColor: cardColor }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold" style={{ color: textColor }}>
                  Select Class
                </Text>
                <TouchableOpacity onPress={() => setClassDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color={mutedColor} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={classes}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 px-2 border-b"
                    style={{ borderColor }}
                    onPress={() => {
                      setSelectedClass(item);
                      setClassDropdownOpen(false);
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{
                        color: selectedClass === item ? primaryColor : textColor,
                        fontWeight: selectedClass === item ? '600' : '400'
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}