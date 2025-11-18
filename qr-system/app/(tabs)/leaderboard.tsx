import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

// Mock data for students
const mockStudents = [
  { id: 1, name: 'Ahmad bin Iskandar', grade: 'Grade 5', class: 'Class A', points: 450 },
  { id: 2, name: 'Siti Nurhaliza', grade: 'Grade 6', class: 'Class B', points: 420 },
  { id: 3, name: 'Muhammad Rafi', grade: 'Grade 4', class: 'Class A', points: 380 },
  { id: 4, name: 'Nurul Aini', grade: 'Grade 5', class: 'Class C', points: 360 },
  { id: 5, name: 'Zulkifli bin Hassan', grade: 'Grade 6', class: 'Class A', points: 340 },
  { id: 6, name: 'Fatimah bt Ahmad', grade: 'Grade 3', class: 'Class B', points: 320 },
  { id: 7, name: 'Rizal bin Salleh', grade: 'Grade 4', class: 'Class C', points: 310 },
  { id: 8, name: 'Aisha bt Rahman', grade: 'Grade 5', class: 'Class B', points: 290 },
  { id: 9, name: 'Danial bin Mohd', grade: 'Grade 2', class: 'Class A', points: 270 },
  { id: 10, name: 'Maya bt Kassim', grade: 'Grade 3', class: 'Class C', points: 250 },
  { id: 11, name: 'Hakim bin Yusoff', grade: 'Grade 4', class: 'Class B', points: 240 },
  { id: 12, name: 'Sarah bt Aziz', grade: 'Grade 1', class: 'Class A', points: 220 },
  { id: 13, name: 'Amir bin Hamzah', grade: 'Grade 2', class: 'Class B', points: 200 },
  { id: 14, name: 'Liyana bt Omar', grade: 'Grade 3', class: 'Class A', points: 180 },
  { id: 15, name: 'Fahmi bin Zainal', grade: 'Grade 1', class: 'Class C', points: 160 },
];

const grades = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
const classes = ['All Classes', 'Class A', 'Class B', 'Class C'];

export default function Leaderboard() {
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('accent');
  const successColor = useThemeColor('success');
  
  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return mockStudents
      .filter(student =>
        (selectedGrade === 'All Grades' || student.grade === selectedGrade) &&
        (selectedClass === 'All Classes' || student.class === selectedClass)
      )
      .sort((a, b) => b.points - a.points);
  }, [selectedGrade, selectedClass]);
  
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
          <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
            Leaderboard
          </Text>
          <Text className="text-base" style={{ color: mutedColor }}>
            Top performing students this month
          </Text>
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
          {filteredStudents.length > 0 ? (
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