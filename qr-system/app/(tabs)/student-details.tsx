import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { ParentOnly } from '@/components/RoleBasedUI';

// Student data interface
interface StudentDetails {
  id: string;
  name: string;
  grade: string;
  section: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  discipline: {
    points: number;
    incidents: number;
  };
  sahsiah: {
    points: number;
    achievements: number;
  };
  rmt: {
    eligible: boolean;
    claimed: boolean;
    lastClaim: string;
  };
  recentActivity: Array<{
    type: 'attendance' | 'discipline' | 'sahsiah' | 'rmt';
    description: string;
    date: string;
    points?: number;
  }>;
}

export default function StudentDetails() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const successColor = useThemeColor('success');
  const warningColor = useThemeColor('warning');
  
  // State for student data
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call when ready
  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // const studentData = await studentApi.getStudentDetails(studentId);
        
        // Mock data for demonstration
        const mockStudent: StudentDetails = {
          id: studentId,
          name: 'Ahmad',
          grade: '5A',
          section: 'Science',
          attendance: {
            present: 145,
            absent: 8,
            late: 12,
            rate: 92.5
          },
          discipline: {
            points: 85,
            incidents: 2
          },
          sahsiah: {
            points: 120,
            achievements: 8
          },
          rmt: {
            eligible: true,
            claimed: true,
            lastClaim: '2025-12-20'
          },
          recentActivity: [
            {
              type: 'attendance',
              description: 'Present - On time',
              date: '2025-12-25',
              points: 0
            },
            {
              type: 'sahsiah',
              description: 'Helped classmates',
              date: '2025-12-24',
              points: 5
            },
            {
              type: 'discipline',
              description: 'Late to class',
              date: '2025-12-23',
              points: -3
            },
            {
              type: 'rmt',
              description: 'Monthly ration claimed',
              date: '2025-12-20',
              points: 0
            }
          ]
        };
        
        // Simulate API delay
        setTimeout(() => {
          setStudent(mockStudent);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error loading student details:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load student details');
      }
    };

    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'checkmark-circle';
      case 'sahsiah':
        return 'trophy';
      case 'discipline':
        return 'warning';
      case 'rmt':
        return 'restaurant';
      default:
        return 'ellipse';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return successColor;
      case 'sahsiah':
        return primaryColor;
      case 'discipline':
        return warningColor;
      case 'rmt':
        return '#8B5CF6';
      default:
        return mutedColor;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ backgroundColor }} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="refresh" size={40} color={mutedColor} />
          <Text className="mt-4 text-base" style={{ color: mutedColor }}>
            Loading student details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={{ backgroundColor }} className="flex-1">
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="alert-circle" size={40} color={mutedColor} />
          <Text className="mt-4 text-lg text-center" style={{ color: mutedColor }}>
            Student not found
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-5 pt-5 pb-6">
          <View className="flex-row items-center">
            <View 
              className="w-16 h-16 rounded-full justify-center items-center mr-4 shadow-md border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <Text className="text-2xl">{student.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold mb-1" style={{ color: textColor }}>
                {student.name}
              </Text>
              <Text className="text-base opacity-80" style={{ color: mutedColor }}>
                Grade {student.grade} • Section {student.section}
              </Text>
            </View>
            <TouchableOpacity
              className="p-3 rounded-full"
              style={{ backgroundColor: cardColor }}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between">
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-md border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="checkmark-circle" size={24} color={successColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.attendance.rate}%
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                Attendance Rate
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-md border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="trophy" size={24} color={primaryColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.sahsiah.points}
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                Sahsiah Points
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-md border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="warning" size={24} color={warningColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.discipline.points}
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                Discipline Points
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Information */}
        <View className="px-5 mb-6">
          <View className="rounded-2xl p-5 border shadow-md" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
              Detailed Information
            </Text>
            
            {/* Attendance Details */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2" style={{ color: textColor }}>
                Attendance
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>Present:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.present} days</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>Absent:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.absent} days</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: mutedColor }}>Late:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.late} times</Text>
              </View>
            </View>

            {/* RMT Information */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2" style={{ color: textColor }}>
                RMT Program
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>Eligible:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>
                  {student.rmt.eligible ? 'Yes' : 'No'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: mutedColor }}>Last Claim:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.rmt.lastClaim}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-5 mb-6">
          <View className="rounded-2xl p-5 border shadow-md" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
              Recent Activity
            </Text>
            
            {student.recentActivity.map((activity, index) => (
              <View key={index} className="flex-row items-center mb-3 p-3 rounded-xl" style={{ backgroundColor: cardColor, borderWidth: 1, borderColor }}>
                <View 
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: getActivityColor(activity.type) }}
                >
                  <Ionicons 
                    name={getActivityIcon(activity.type) as any} 
                    size={18} 
                    color="white" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: textColor }}>
                    {activity.description}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm" style={{ color: mutedColor }}>
                      {activity.date}
                    </Text>
                    {activity.points !== undefined && (
                      <Text className="text-sm ml-2 font-medium" style={{ 
                        color: activity.points > 0 ? successColor : activity.points < 0 ? warningColor : mutedColor 
                      }}>
                        {activity.points > 0 ? '+' : ''}{activity.points} points
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Parent-only actions */}
        <ParentOnly>
          <View className="px-5 mb-6">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => {
                  // TODO: Navigate to attendance details
                  console.log('View attendance details for:', student.id);
                }}
              >
                <Text className="text-center font-medium" style={{ color: textColor }}>
                  View Attendance
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => {
                  // TODO: Navigate to reports
                  console.log('Generate report for:', student.id);
                }}
              >
                <Text className="text-center font-medium" style={{ color: textColor }}>
                  Generate Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ParentOnly>
      </ScrollView>
    </SafeAreaView>
  );
}