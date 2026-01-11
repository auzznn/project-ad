import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { studentApi, StudentDetails } from '@/api/studentApi';


export default function StudentDetailsScreen() {
  const { t } = useTranslation();
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
  const errorColor = useThemeColor('error')
  
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
        
        // Extract grade and section from student data
        const grade = studentData.grade || studentData.class || 'N/A';
        const section = studentData.section || 'N/A';
        
        // Fetch sahsiah points from leaderboard API using grade and section
        let sahsiahPoints = 0;
        
        if (grade !== 'N/A' && section !== 'N/A') {
          try {
            const leaderboardData = await studentApi.getLeaderboardByGradeAndSection(grade, section);
            
            // Find the student in the leaderboard data
            const studentEntry = leaderboardData?.find((entry: any) =>
              entry.student_id?.toString() === studentId
            );
            
            if (studentEntry) {
              sahsiahPoints = studentEntry.point || 0;
            }
          } catch (sahsiahError) {
            // Use default values if API call fails
            sahsiahPoints = studentData.sahsiah?.points || 0;
          }
        } else {
          // Use default values if grade or section is not available
          sahsiahPoints = studentData.sahsiah?.points || 0;
        }
        
        // Fetch discipline points from leaderboard API using grade and section
        let disciplinePoints = 0;
        let disciplineIncidents = 0;
        
        if (grade !== 'N/A' && section !== 'N/A') {
          try {
            const disciplineLeaderboardData = await studentApi.getDisciplineLeaderboardByGradeAndSection(grade, section);
            
            // Find the student in the discipline leaderboard data
            const disciplineStudentEntry = disciplineLeaderboardData?.find((entry: any) =>
              entry.student_id?.toString() === studentId
            );
            
            if (disciplineStudentEntry) {
              disciplinePoints = disciplineStudentEntry.point || 0;
            }
          } catch (disciplineError) {
            // Use default values if API call fails
            disciplinePoints = studentData.discipline?.points || 0;
            disciplineIncidents = studentData.discipline?.incidents || 0;
          }
        } else {
          // Use default values if grade or section is not available
          disciplinePoints = studentData.discipline?.points || 0;
          disciplineIncidents = studentData.discipline?.incidents || 0;
        }
        
        // Fetch sahsiah records for recent activity
        let recentActivity: any[] = [];
        try {
          // Fetch sahsiah types to get type information
          const sahsiahTypes = await studentApi.getSahsiahTypes();
          
          // Create a map of sahsiah_type id to type information
          const sahsiahTypeMap = new Map<number, any>();
          sahsiahTypes.forEach((type: any) => {
            sahsiahTypeMap.set(type.id, type);
          });
          
          // Fetch sahsiah records for the student
          const sahsiahRecords = await studentApi.getStudentSahsiahRecords(studentId);
          
          // Transform sahsiah records to recent activity format using sahsiah_type key
          if (Array.isArray(sahsiahRecords)) {
            recentActivity = sahsiahRecords.map((record: any) => {
              const typeId = record.sahsiah_type;
              const typeInfo = sahsiahTypeMap.get(typeId);
              const timestamp = record.timestamp ? new Date(record.timestamp).getTime() : 0;
              
              return {
                type: 'sahsiah' as const,
                description: typeInfo?.name || 'Sahsiah Record',
                date: record.timestamp ? new Date(record.timestamp).toLocaleString() : 'Unknown',
                timestamp: timestamp,
                points: typeInfo?.points || 0
              };
            });
          }
        } catch (sahsiahRecordsError) {
          // Use default recent activity if API call fails
          recentActivity = studentData.recentActivity || [];
        }
        
        // Fetch discipline records for recent activity
        try {
          // Fetch discipline types to get type information
          const disciplineTypes = await studentApi.getDisciplineTypes();
          
          // Create a map of discipline_type id to type information
          const disciplineTypeMap = new Map<number, any>();
          disciplineTypes.forEach((type: any) => {
            disciplineTypeMap.set(type.id, type);
          });
          
          // Fetch discipline records for the student
          const disciplineRecords = await studentApi.getStudentDisciplineRecords();
          
          const studentDiscipline = Array.isArray(disciplineRecords) ? disciplineRecords.filter((record: any) => {
                        return record.student_id?.toString() === studentId;

          }) : [];
          
          // Transform discipline records to recent activity format
          if (Array.isArray(studentDiscipline)) {
            const disciplineActivities = studentDiscipline.map((record: any) => {
              const typeId = record.discipline_type;
              const typeInfo = disciplineTypeMap.get(typeId);
              const timestamp = record.timestamp ? new Date(record.timestamp).getTime() : 0;
              
              return {
                type: 'discipline' as const,
                description: typeInfo?.name || 'Discipline Record',
                date: record.timestamp ? new Date(record.timestamp).toLocaleString() : 'Unknown',
                timestamp: timestamp,
                points: typeInfo?.points || 0
              };
            });
            
            // Combine sahsiah and discipline activities, sorted by timestamp
            recentActivity = [...recentActivity, ...disciplineActivities].sort((a, b) => {
              return (b.timestamp || 0) - (a.timestamp || 0);
            });
          }
        } catch (disciplineRecordsError) {
          // If discipline records fail, continue with only sahsiah activities
        }
        
        // Fetch attendance statistics to get detailed information
        let attendanceData = {
          present: 0,
          absent: 0,
          late: 0,
          rate: 0
        };
        try {
          const currentYear = new Date().getFullYear().toString();
          const attendanceStats = await studentApi.getAttendanceStatistics(currentYear);
          
          // Filter attendance records for the current student
          const studentAttendance = Array.isArray(attendanceStats) ? attendanceStats.find((record: any) =>
            record.student_id?.toString() === studentId
          ) : null;
          
          // Calculate attendance statistics
          attendanceData = {
            present: studentAttendance?.present,
            absent: studentAttendance?.absent,
            late: studentAttendance?.late,
            rate: studentAttendance?.attendance_rate * 100
          };
        } catch (attendanceStatsError) {
          // Use default values if API call fails
          attendanceData = {
            present: studentData.attendance?.present || 0,
            absent: studentData.attendance?.absent || 0,
            late: studentData.attendance?.late || 0,
            rate: studentData.attendance?.rate || 0
          };
        }
        
        // Fetch RMT statistics to get last claim
        let rmtLastClaim = 'Never';
        try {
          const rmtStats = await studentApi.getRMTStatistics();
          
          // Find the student in the RMT statistics array
          const studentRMT = Array.isArray(rmtStats) ? rmtStats.find((stat: any) =>
            stat.student_id?.toString() === studentId
          ) : null;
          
          // Extract last claim date from RMT statistics using latest_present
          if (studentRMT && studentRMT.latest_present) {
            rmtLastClaim = new Date(studentRMT.latest_present).toLocaleDateString('en-MY');
          }
        } catch (rmtStatsError) {
          // Use default value if API call fails
          rmtLastClaim = studentData.rmt?.lastClaim || 'Never';
        }
        
        // Transform the API response to match our expected structure
        const transformedData: StudentDetails = {
          id: studentData.id || studentId,
          name: studentData.name || studentData.username || 'Unknown',
          grade: grade,
          section: section,
          attendance: attendanceData,
          discipline: {
            points: disciplinePoints,
            incidents: disciplineIncidents
          },
          sahsiah: {
            points: sahsiahPoints,
            achievements: 0
          },
          rmt: {
            eligible: studentData.rmt?.eligible || studentData.rmt_elligible || false,
            claimed: studentData.rmt?.claimed || false,
            lastClaim: rmtLastClaim
          },
          recentActivity: recentActivity
        };
        
        setStudent(transformedData);
        setLoading(false);
        
      } catch (error) {
        setLoading(false);
        Alert.alert(t('error'), t('somethingWentWrong'));
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
            {t('loading')}
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
            {t('noDataAvailable')}
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
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
                {t('class')} {student.grade} • {student.section}
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
                {t('attendance')} Rate
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="trophy" size={24} color={primaryColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                {student.sahsiah.points}
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                {t('sahsiah')} {t('points')}
              </Text>
            </View>
            
            <View className="w-[30%] rounded-2xl p-4 items-center shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
              <Ionicons name="warning" size={24} color={warningColor} />
              <Text className="text-2xl font-bold mt-2 mb-1" style={{ color: textColor }}>
                - {student.discipline.points}
              </Text>
              <Text className="text-xs text-center" style={{ color: mutedColor }}>
                {t('discipline')} {t('points')}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Information */}
        <View className="px-5 mb-6">
          <View className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
              {t('studentDetails')}
            </Text>
            
            {/* Attendance Details */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2" style={{ color: textColor }}>
                {t('attendance')}
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>{t('present')}:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.present} days</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>{t('absent')}:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.absent} days</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: mutedColor }}>{t('late')}:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.attendance.late} times</Text>
              </View>
            </View>

            {/* RMT Information */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2" style={{ color: textColor }}>
                {t('rmt')} Program
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: mutedColor }}>{t('eligible')}:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>
                  {student.rmt.eligible ? 'Yes' : 'No'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: mutedColor }}>{t('lastClaim')}:</Text>
                <Text className="text-sm font-medium" style={{ color: textColor }}>{student.rmt.lastClaim}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-5 mb-6">
          <View className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-xl font-semibold mb-4" style={{ color: textColor }}>
              {t('loading')}
            </Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
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
                        color: activity.type === 'sahsiah' ? successColor : errorColor 
                      }}>
                        {activity.type === 'sahsiah' ? '+' : '-'}{activity.points} {t('points')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
            </ScrollView>
          </View>
        </View>

        {/* Parent-only actions */}
    </SafeAreaView>
  );
}