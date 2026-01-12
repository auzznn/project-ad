import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { studentApi, StudentDetails } from '@/api/studentApi';

// Memoized activity item component to prevent unnecessary re-renders
const ActivityItem = memo(({
  activity,
  textColor,
  mutedColor,
  successColor,
  errorColor,
  getActivityIcon,
  getActivityColor,
  t
}: {
  activity: any;
  textColor: string;
  mutedColor: string;
  successColor: string;
  errorColor: string;
  getActivityIcon: (type: string) => string;
  getActivityColor: (type: string) => string;
  t: (key: string) => string;
}) => {
  return (
    <View className="flex-row items-center mb-3 p-3 rounded-xl" style={{ borderWidth: 1, borderColor: mutedColor }}>
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
  );
});


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

  // Load student data from API - Optimized with parallel calls
  useEffect(() => {
    const loadStudentDetails = async () => {
      try {
        setLoading(true);
        
        console.log('[StudentDetails] Loading student details for ID:', studentId);
        
        // Fetch student data from API first
        const studentData: any = await studentApi.getStudentDetails(studentId);
        console.log('[StudentDetails] Student data received:', studentData);
        
        // Extract grade and section from student data
        const grade = studentData.grade || studentData.class || 'N/A';
        const section = studentData.section || 'N/A';
        
        // Prepare parallel API calls
        const apiPromises: Promise<any>[] = [];
        
        console.log('[StudentDetails] Grade:', grade, 'Section:', section);
        
        // Add leaderboard calls if grade and section are available
        if (grade !== 'N/A' && section !== 'N/A') {
          apiPromises.push(
            studentApi.getLeaderboardByGradeAndSection(grade, section)
              .catch((error) => {
                console.error('[StudentDetails] Leaderboard API error:', error);
                return null;
              })
          );
          apiPromises.push(
            studentApi.getDisciplineLeaderboardByGradeAndSection(grade, section)
              .catch((error) => {
                console.error('[StudentDetails] Discipline leaderboard API error:', error);
                return null;
              })
          );
        }
        
        // Add other API calls
        apiPromises.push(
          studentApi.getSahsiahTypes()
            .catch((error) => {
              console.error('[StudentDetails] Sahsiah types API error:', error);
              return [];
            }),
          studentApi.getStudentSahsiahRecords(studentId)
            .catch((error) => {
              console.error('[StudentDetails] Sahsiah records API error:', error);
              return [];
            }),
          studentApi.getDisciplineTypes()
            .catch((error) => {
              console.error('[StudentDetails] Discipline types API error:', error);
              return [];
            }),
          studentApi.getStudentDisciplineRecords()
            .catch((error) => {
              console.error('[StudentDetails] Discipline records API error:', error);
              return [];
            }),
          studentApi.getAttendanceStatistics(new Date().getFullYear().toString())
            .catch((error) => {
              console.error('[StudentDetails] Attendance stats API error:', error);
              return [];
            }),
          studentApi.getRMTStatistics()
            .catch((error) => {
              console.error('[StudentDetails] RMT stats API error:', error);
              return [];
            })
        );
        
        // Execute all API calls in parallel
        const [
          leaderboardData,
          disciplineLeaderboardData,
          sahsiahTypes,
          sahsiahRecords,
          disciplineTypes,
          disciplineRecords,
          attendanceStats,
          rmtStats
        ] = await Promise.all(apiPromises);
        
        // Process sahsiah points
        let sahsiahPoints = 0;
        if (grade !== 'N/A' && section !== 'N/A' && leaderboardData) {
          // Handle both array and object responses with entry property
          const leaderboardArray = Array.isArray(leaderboardData)
            ? leaderboardData
            : (leaderboardData?.entry || []);
          
          console.log('[StudentDetails] Leaderboard array:', leaderboardArray);
          
          const studentEntry = leaderboardArray?.find((entry: any) =>
            entry.student_id?.toString() === studentId
          );
          sahsiahPoints = studentEntry?.point || studentData.sahsiah?.points || 0;
        } else {
          sahsiahPoints = studentData.sahsiah?.points || 0;
        }
        
        // Process discipline points
        let disciplinePoints = 0;
        let disciplineIncidents = 0;
        if (grade !== 'N/A' && section !== 'N/A' && disciplineLeaderboardData) {
          // Handle both array and object responses with entry property
          const disciplineLeaderboardArray = Array.isArray(disciplineLeaderboardData)
            ? disciplineLeaderboardData
            : (disciplineLeaderboardData?.entry || []);
          
          console.log('[StudentDetails] Discipline leaderboard array:', disciplineLeaderboardArray);
          
          const disciplineStudentEntry = disciplineLeaderboardArray?.find((entry: any) =>
            entry.student_id?.toString() === studentId
          );
          disciplinePoints = disciplineStudentEntry?.point || studentData.discipline?.points || 0;
          disciplineIncidents = studentData.discipline?.incidents || 0;
        } else {
          disciplinePoints = studentData.discipline?.points || 0;
          disciplineIncidents = studentData.discipline?.incidents || 0;
        }
        
        // Process recent activity - Optimize with type maps
        let recentActivity: any[] = [];
        
        // Create type maps for efficient lookup
        const sahsiahTypeMap = new Map<number, any>();
        sahsiahTypes?.forEach((type: any) => sahsiahTypeMap.set(type.id, type));
        
        const disciplineTypeMap = new Map<number, any>();
        disciplineTypes?.forEach((type: any) => disciplineTypeMap.set(type.id, type));
        
        // Process sahsiah records
        if (Array.isArray(sahsiahRecords)) {
          recentActivity = sahsiahRecords.map((record: any) => {
            const typeInfo = sahsiahTypeMap.get(record.sahsiah_type);
            const dateObj = record.timestamp ? new Date(record.timestamp) : null;
            const timestamp = dateObj ? dateObj.getTime() : 0;
            
            return {
              type: 'sahsiah' as const,
              description: typeInfo?.name || 'Sahsiah Record',
              date: dateObj ? dateObj.toLocaleString() : 'Unknown',
              timestamp,
              points: typeInfo?.points || 0
            };
          });
        }
        
        // Process discipline records
        if (Array.isArray(disciplineRecords)) {
          const studentDiscipline = disciplineRecords.filter((record: any) =>
            record.student_id?.toString() === studentId
          );
          
          const disciplineActivities = studentDiscipline.map((record: any) => {
            const typeInfo = disciplineTypeMap.get(record.discipline_type);
            const dateObj = record.timestamp ? new Date(record.timestamp) : null;
            const timestamp = dateObj ? dateObj.getTime() : 0;
            
            return {
              type: 'discipline' as const,
              description: typeInfo?.name || 'Discipline Record',
              date: dateObj ? dateObj.toLocaleString() : 'Unknown',
              timestamp,
              points: typeInfo?.points || 0
            };
          });
          
          // Combine and sort activities
          recentActivity = [...recentActivity, ...disciplineActivities].sort((a, b) =>
            (b.timestamp || 0) - (a.timestamp || 0)
          );
        }
        
        // Process attendance statistics
        let attendanceData = {
          present: 0,
          absent: 0,
          late: 0,
          rate: 0
        };
        if (Array.isArray(attendanceStats)) {
          const studentAttendance = attendanceStats.find((record: any) =>
            record.student_id?.toString() === studentId
          );
          attendanceData = {
            present: studentAttendance?.present ?? studentData.attendance?.present ?? 0,
            absent: studentAttendance?.absent ?? studentData.attendance?.absent ?? 0,
            late: studentAttendance?.late ?? studentData.attendance?.late ?? 0,
            rate: (studentAttendance?.attendance_rate ?? 0) * 100
          };
        } else {
          attendanceData = {
            present: studentData.attendance?.present || 0,
            absent: studentData.attendance?.absent || 0,
            late: studentData.attendance?.late || 0,
            rate: studentData.attendance?.rate || 0
          };
        }
        
        // Process RMT statistics
        let rmtLastClaim = 'Never';
        if (Array.isArray(rmtStats)) {
          const studentRMT = rmtStats.find((stat: any) =>
            stat.student_id?.toString() === studentId
          );
          if (studentRMT?.latest_present) {
            rmtLastClaim = new Date(studentRMT.latest_present).toLocaleDateString('en-MY');
          }
        } else {
          rmtLastClaim = studentData.rmt?.lastClaim || 'Never';
        }
        
        // Transform the API response to match our expected structure
        const transformedData: StudentDetails = {
          id: studentData.id || studentId,
          name: studentData.name || studentData.username || 'Unknown',
          grade,
          section,
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
          recentActivity
        };
        
        setStudent(transformedData);
        setLoading(false);
        
      } catch (error) {
        console.error('[StudentDetails] Error loading student details:', error);
        setLoading(false);
        Alert.alert(t('error'), t('somethingWentWrong'));
      }
    };

    if (studentId) {
      loadStudentDetails();
    } else {
      console.error('[StudentDetails] No studentId provided');
      setLoading(false);
    }
  }, [studentId, t]);

  // Memoize callback functions to prevent unnecessary re-renders
  const getActivityIcon = useCallback((type: string) => {
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
  }, []);

  const getActivityColor = useCallback((type: string) => {
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
  }, [successColor, primaryColor, warningColor, mutedColor]);

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
                {student.discipline.points}
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
              {t('recentActivity')}
            </Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {student.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={`${activity.type}-${activity.date}-${index}`}
                  activity={activity}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  successColor={successColor}
                  errorColor={errorColor}
                  getActivityIcon={getActivityIcon}
                  getActivityColor={getActivityColor}
                  t={t}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Parent-only actions */}
    </SafeAreaView>
  );
}