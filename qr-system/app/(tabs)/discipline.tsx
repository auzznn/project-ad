import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePermissions } from '@/hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';
import { studentApi } from '@/api/studentApi';
import { useFocusEffect } from 'expo-router';
import { RoleBasedUI, AdminOrTeacher } from '@/components/RoleBasedUI';

// Dynamic student data structure
interface StudentData {
  id: number;
  student_id: string;
  name: string;
  grade: string;
  section: string;
  points: number;
}

// API response interface for leaderboard
interface LeaderboardResponse {
  student_id: number;
  student_name: string;
  point: number;
  class_room: string;
  ranking: number;
}

export default function Discipline() {
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic filter options extracted from data
  const [availableGrades, setAvailableGrades] = useState<string[]>(['All Grades']);
  const [availableSections, setAvailableSections] = useState<string[]>(['All Sections']);
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('accent');
  const successColor = useThemeColor('success');
  
  // Role-based permissions
  const { hasPermission } = usePermissions();
  
  // Load student data from API on component mount
  useEffect(() => {
    loadStudentData();
  }, []);
  

  useFocusEffect(
    React.useCallback(() => {
      loadStudentData();
    }, [])
  );
  
  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch discipline leaderboard data from API
      const leaderboardData: LeaderboardResponse[] = await studentApi.getDisciplineLeaderboard();
      
      // Transform API data to match our StudentData interface
      // and fetch additional student details for class information
      const studentsArray: StudentData[] = await Promise.all(
        leaderboardData.map(async (student: LeaderboardResponse) => {
          try {
            // Get detailed student information including class
            const studentDetails = await studentApi.getStudent(student.student_id.toString());
            
            return {
              id: student.ranking,
              student_id: student.student_id.toString(),
              name: student.student_name,
              grade: studentDetails.grade || 'Unknown',
              section: studentDetails.section || 'Unknown',
              points: student.point
            };
          } catch (error) {
            // If we can't get student details, use the leaderboard data with class_room
            console.warn(`Failed to get details for student ${student.student_id}:`, error);
            return {
              id: student.ranking,
              student_id: student.student_id.toString(),
              name: student.student_name,
              grade: 'Unknown',
              section: student.class_room || 'Unknown',
              points: student.point
            };
          }
        })
      );
      
      // Sort by ranking (which should already be sorted by points)
      studentsArray.sort((a, b) => a.id - b.id);
      
      console.log(`Loaded ${studentsArray.length} students from API discipline leaderboard`);
      setStudents(studentsArray);
      
      // Extract unique grades and sections from the data
      const uniqueGrades = Array.from(new Set(studentsArray.map(s => s.grade).filter(g => g && g !== 'Unknown')));
      const uniqueSections = Array.from(new Set(studentsArray.map(s => s.section).filter(c => c && c !== 'Unknown')));
      
      // Update filter options with actual data
      setAvailableGrades(['All Grades', ...uniqueGrades.sort()]);
      setAvailableSections(['All Sections', ...uniqueSections.sort()]);
      
      // Reset filters if current selection no longer exists
      if (selectedGrade !== 'All Grades' && !uniqueGrades.includes(selectedGrade)) {
        setSelectedGrade('All Grades');
      }
      if (selectedSection !== 'All Sections' && !uniqueSections.includes(selectedSection)) {
        setSelectedSection('All Sections');
      }
      
    } catch (error) {
      console.error('Error loading discipline leaderboard data from API:', error);
      // Set empty array on error to prevent infinite loading
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter(student =>
        (selectedGrade === 'All Grades' || student.grade === selectedGrade) &&
        (selectedSection === 'All Sections' || student.section === selectedSection)
      )
      .sort((a, b) => b.points - a.points);
  }, [students, selectedGrade, selectedSection]);
  
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
                Discipline Leaderboard
              </Text>
              <Text className="text-base" style={{ color: mutedColor }}>
                Top disciplined students this year.
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
            
            {/* Section Filter */}
            <View className="flex-1">
              <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                Section
              </Text>
              <TouchableOpacity
                className="rounded-xl border px-4 py-3 flex-row items-center justify-between"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => setSectionDropdownOpen(true)}
              >
                <Text className="text-base" style={{ color: textColor }}>
                  {selectedSection}
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
                Loading discipline leaderboard data...
              </Text>
            </View>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              // Use the ranking from the API response (stored in student.id)
              const rank = student.id;
              return (
                <View
                  key={`${student.student_id}-${rank}`}
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
                          {student.grade} • {student.section}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Points */}
                    <View className="items-end">
                      <Text className="text-lg font-bold" style={{ color: primaryColor }}>
                        {student.points}
                      </Text>
                      <Text className="text-xs" style={{ color: mutedColor }}>
                        discipline points
                      </Text>
                      
                    </View>
                  </View>
                </View>
              );
            })
          ) : students.length === 0 ? (
            <View
              className="rounded-2xl p-8 items-center justify-center"
              style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
            >
              <Ionicons name="alert-circle" size={40} color={mutedColor} />
              <Text className="text-base mt-3 text-center" style={{ color: mutedColor }}>
                No discipline leaderboard data available
              </Text>
              <Text className="text-sm mt-2 text-center" style={{ color: mutedColor }}>
                Try refreshing or check your connection
              </Text>
            </View>
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
                data={availableGrades}
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
      
      {/* Section Dropdown Modal */}
      <Modal
        transparent={true}
        visible={sectionDropdownOpen}
        animationType="fade"
        onRequestClose={() => setSectionDropdownOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setSectionDropdownOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-5">
            <View
              className="rounded-2xl p-4 w-full max-h-[80%]"
              style={{ backgroundColor: cardColor }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold" style={{ color: textColor }}>
                  Select Section
                </Text>
                <TouchableOpacity onPress={() => setSectionDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color={mutedColor} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableSections}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 px-2 border-b"
                    style={{ borderColor }}
                    onPress={() => {
                      setSelectedSection(item);
                      setSectionDropdownOpen(false);
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{
                        color: selectedSection === item ? primaryColor : textColor,
                        fontWeight: selectedSection === item ? '600' : '400'
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