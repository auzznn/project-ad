import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { ParentOnly } from '@/components/RoleBasedUI';
import { studentApi, StudentDetails } from '@/api/studentApi';


export default function StudentDetailsScreen() {
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

  // Load student data from API
  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch student data from API
        const studentData: any = await studentApi.getStudentDetails(studentId);
        
        // Log the API response to understand the structure
        console.log('API Response:', JSON.stringify(studentData, null, 2));
        
        // Transform the API response to match our expected structure
        const transformedData: StudentDetails = {
          id: studentData.id || studentId,
          name: studentData.name || studentData.username || 'Unknown',
          grade: studentData.grade || studentData.class || 'N/A',
          section: studentData.section || 'N/A',
          attendance: {
            present: studentData.attendance?.present || 0,
            absent: studentData.attendance?.absent || 0,
            late: studentData.attendance?.late || 0,
            rate: studentData.attendance?.rate || 0
          },
          discipline: {
            points: studentData.discipline?.points || 0,
            incidents: studentData.discipline?.incidents || 0
          },
          sahsiah: {
            points: studentData.sahsiah?.points || 0,
            achievements: studentData.sahsiah?.achievements || 0
          },
          rmt: {
            eligible: studentData.rmt?.eligible || studentData.rmt_elligible || false,
            claimed: studentData.rmt?.claimed || false,
            lastClaim: studentData.rmt?.lastClaim || 'Never'
          },
          recentActivity: studentData.recentActivity || []
        };
        
        setStudent(transformedData);
        setLoading(false);
        
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
              className="w-16 h-16 rounded-full justify-center items-center mr-4 shadow-sm border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <Text className="text-2xl">{student.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold mb-1" style={{ color: textColor }}>
                {student.name}
              </Text>
              <Text className="text-base opacity-80" style={{ color: mutedColor }}>
                Class {student.grade} • {student.section}
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
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="checkmark-circle" size={24} color={successColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.attendance.rate}%
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                Attendance Rate
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="trophy" size={24} color={primaryColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.sahsiah.points}
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                Sahsiah Points
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
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
          <View className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
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
          <View className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
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
      </ScrollView>
    </SafeAreaView>
  );
}