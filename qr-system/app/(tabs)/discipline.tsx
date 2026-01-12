import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { studentApi } from "@/api/studentApi";
import { useFocusEffect } from "expo-router";

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

// API response wrapper with pagination links
interface PaginatedLeaderboardResponse {
  entry: LeaderboardResponse[];
  links: {
    next: string | null;
    previous: string | null;
  };
}

// Child data structure returned from API
interface ChildData {
  id: number;
  name: string;
  grade: number;
  section: string;
  academic_year: string;
  rmt_elligible: boolean;
  qr_code: string;
}

// Sentinel value for "All" option
const ALL_GRADES = "ALL_GRADES";
const ALL_SECTIONS = "ALL_SECTIONS";

export default function Discipline() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState(ALL_GRADES);
  const [selectedSection, setSelectedSection] = useState(ALL_SECTIONS);
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

  // Dynamic filter options extracted from data
  const [availableGrades, setAvailableGrades] = useState<string[]>([
    ALL_GRADES,
  ]);

  // Children data for parent view highlighting
  const [children, setChildren] = useState<ChildData[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  // In-memory cache for student details to avoid redundant API calls
  const studentDetailsCache = useRef<Map<string, any>>(new Map());

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('accent');
  const successColor = useThemeColor('success');
  
  // Load student data from API on component mount
  useEffect(() => {
    isMountedRef.current = true;
    loadStudentData();
    // Load children data if user is a parent
    if (user?.role === "parent") {
      loadChildrenData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudentData();
      // Reload children data when screen is focused
      if (user?.role === "parent") {
        loadChildrenData();
      }
    }, [selectedGrade, selectedSection])
  );
  
  const loadStudentData = async (url?: string) => {
    const isLoadMore = !!url;

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let response: PaginatedLeaderboardResponse;

      // Fetch discipline leaderboard data from API based on filters
      if (
        selectedGrade !== ALL_GRADES &&
        selectedSection !== ALL_SECTIONS
      ) {
        // Filter by both grade and section
        response = await studentApi.getDisciplineLeaderboardByGradeAndSection(
          selectedGrade,
          selectedSection,
          url
        );
      } else if (selectedGrade !== ALL_GRADES) {
        // Filter by grade only
        response = await studentApi.getDisciplineLeaderboardByGrade(
          selectedGrade,
          url
        );
      } else {
        // No filter, get all leaderboard data
        response = await studentApi.getDisciplineLeaderboard(url);
      }

      const leaderboardData = response.entry || [];
      const nextUrl = response.links?.next || null;

      // Transform API data to match our StudentData interface
      // OPTIMIZATION: Use class_room from leaderboard API response directly instead of fetching individual student details
      // This eliminates the N+1 query problem
      const studentsArray: StudentData[] = leaderboardData.map(
        (student: LeaderboardResponse) => {
          // Parse class_room to extract grade and section if available
          // Format expected: "Grade 1 - Section A" or similar
          let grade = "Unknown";
          let section = "Unknown";

          if (student.class_room) {
            // Try to parse class_room string
            if (student.class_room) {
              const match = student.class_room.match(/^(\d+)([a-zA-Z]+)$/);
              if (match) {
                grade = match[1]; // digits part → grade
                section = match[2]; // letters part → section
              } else {
                // fallback if format is unexpected
                grade = student.class_room;
                section = "Unknown";
              }
            }
          }

          return {
            id: student.ranking,
            student_id: student.student_id.toString(),
            name: student.student_name,
            grade: grade,
            section: section,
            points: student.point,
          };
        }
      );

      if (isMountedRef.current) {
        console.log(
          `Loaded ${studentsArray.length} students from API discipline leaderboard`
        );

        if (isLoadMore) {
          // Append new students to existing list
          setStudents((prevStudents) => [...prevStudents, ...studentsArray]);
        } else {
          // Replace students list with new data
          setStudents(studentsArray);

          // Extract unique grades from the data (only when no filter is applied)
          if (selectedGrade === ALL_GRADES) {
            const uniqueGrades = Array.from(
              new Set(
                studentsArray
                  .map((s) => s.grade)
                  .filter((g) => g && g !== "Unknown")
              )
            );
            console.log("Unique grades extracted:", uniqueGrades);
            // Update filter options with actual data
            setAvailableGrades([ALL_GRADES, ...uniqueGrades.sort()]);
          }
        }

        // Update next page URL
        setNextPageUrl(nextUrl);
      }
    } catch (error) {
      console.error("Error loading discipline leaderboard data from API:", error);
      // Set empty array on error to prevent infinite loading
      if (isMountedRef.current) {
        if (!isLoadMore) {
          setStudents([]);
        }
      }
    } finally {
      if (isMountedRef.current) {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  };

  // Handle loading more data when reaching the end of the list
  const handleLoadMore = useCallback(() => {
    if (nextPageUrl && !loadingMore && !loading) {
      loadStudentData(nextPageUrl);
    }
  }, [nextPageUrl, loadingMore, loading]);

  // Render load more button or loading indicator
  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View className="py-4 items-center">
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={20} color={mutedColor} />
            <Text className="ml-2 text-sm" style={{ color: mutedColor }}>
              {t("loading")}
            </Text>
          </View>
        </View>
      );
    }

    // Show load more button if there are more pages available
    if (nextPageUrl && students.length >= 20) {
      return (
        <View className="py-4 px-5">
          <TouchableOpacity
            className="rounded-xl py-3 px-6 items-center"
            style={{ backgroundColor: primaryColor }}
            onPress={handleLoadMore}
          >
            <Text className="text-base font-semibold" style={{ color: "white" }}>
              {t("loadMore")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [loadingMore, nextPageUrl, students.length, primaryColor, mutedColor, t, handleLoadMore]);
  
  // Load children data for parent view
  const loadChildrenData = useCallback(async () => {
    if (!user?.user_id || user.role !== "parent") {
      return;
    }

    try {
      setChildrenLoading(true);
      const childrenData = await studentApi.getChildren(user.user_id);
      if (isMountedRef.current) {
        setChildren(childrenData);
        console.log(
          `Loaded ${childrenData.length} children for parent ${user.user_id}`
        );
      }
    } catch (error) {
      console.error("Error loading children data:", error);
      if (isMountedRef.current) {
        setChildren([]);
      }
    } finally {
      if (isMountedRef.current) {
        setChildrenLoading(false);
      }
    }
  }, [user?.user_id, user?.role]);
  
  // Students are already filtered and sorted by the API based on ranking
  // No client-side filtering or sorting needed
  const filteredStudents = useMemo(() => {
    return students;
  }, [students]);
  
  // Get available sections based on selected grade
  // When a grade is selected, sections are fetched from the API
  // When no grade is selected, show 'All Sections' only
  const availableSectionsForGrade = useMemo(() => {
    if (selectedGrade === ALL_GRADES) {
      return [ALL_SECTIONS];
    }
    // Extract sections from the API response (already filtered by grade)
    const sections = Array.from(
      new Set(
        students.map((s) => s.section).filter((c) => c && c !== "Unknown")
      )
    );
    return [ALL_SECTIONS, ...sections.sort()];
  }, [students, selectedGrade]);

  // Handle grade selection change
  const handleGradeChange = useCallback((grade: string) => {
    setSelectedGrade(grade);
    // Reset section when grade changes
    setSelectedSection(ALL_SECTIONS);
  }, []);

  // Check if a student is a child of the current parent user
  const isChildOfParent = useCallback(
    (studentId: string): boolean => {
      if (user?.role !== "parent") {
        return false;
      }
      return children.some((child) => child.id?.toString() === studentId);
    },
    [user?.role, children]
  );

  // Get highlight style for child entries
  const getChildHighlightStyle = useCallback(
    (studentId: string) => {
      if (!isChildOfParent(studentId)) {
        return {};
      }

      return {
        backgroundColor: `${primaryColor}15`,
        borderColor: primaryColor,
        borderWidth: 2,
      };
    },
    [isChildOfParent, primaryColor]
  );
  
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
        return "trophy";
      case 2:
        return "medal";
      case 3:
        return "ribbon";
      default:
        return "star-outline";
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor }}
      className="flex-1 pt-6"
      edges={["top"]}
    >
      {/* Header - Fixed */}
      <View className="px-5 pt-5 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: textColor }}
            >
              {t("disciplineLeaderboard")}
            </Text>
            <Text className="text-base" style={{ color: mutedColor }}>
              {t("topDisciplinedStudents")}
            </Text>
          </View>
          <TouchableOpacity
            className="p-3 rounded-full"
            style={{ backgroundColor: primaryColor }}
            onPress={() => loadStudentData()}
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters - Fixed */}
      <View className="px-5 mb-4">
        <View className="flex-row space-x-3">
          {/* Grade Filter */}
          <View className="flex-1">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              {t("grade")}
            </Text>
            <TouchableOpacity
              className="rounded-xl border px-4 py-3 flex-row items-center justify-between"
              style={{ backgroundColor: cardColor, borderColor }}
              onPress={() => setGradeDropdownOpen(true)}
            >
              <Text className="text-base" style={{ color: textColor }}>
                {selectedGrade === ALL_GRADES ? t("allGrades") : selectedGrade}
              </Text>
              <Ionicons name="chevron-down" size={16} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Section Filter */}
          <View className="flex-1">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              {t("section")}
            </Text>
            <TouchableOpacity
              className="rounded-xl border px-4 py-3 flex-row items-center justify-between"
              style={{
                backgroundColor:
                  selectedGrade === ALL_GRADES
                    ? `${mutedColor}20`
                    : cardColor,
                borderColor:
                  selectedGrade === ALL_GRADES
                    ? `${mutedColor}40`
                    : borderColor,
              }}
              onPress={() =>
                selectedGrade !== ALL_GRADES && setSectionDropdownOpen(true)
              }
              disabled={selectedGrade === ALL_GRADES}
            >
              <Text
                className="text-base"
                style={{
                  color:
                    selectedGrade === ALL_GRADES ? mutedColor : textColor,
                }}
              >
                {selectedGrade === ALL_GRADES
                  ? t("selectGradeFirst")
                  : selectedSection === ALL_SECTIONS ? t("allSections") : selectedSection}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={selectedGrade === ALL_GRADES ? mutedColor : mutedColor}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Leaderboard List - Scrollable */}
      {loading ? (
        <View className="flex-1 px-5">
          <View
            className="rounded-2xl p-8 items-center justify-center"
            style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
          >
            <Ionicons name="refresh" size={40} color={mutedColor} />
            <Text
              className="text-base mt-3 text-center"
              style={{ color: mutedColor }}
            >
              {t("loadingDisciplineLeaderboardData")}
            </Text>
          </View>
        </View>
      ) : filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => `${item.student_id}-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
          ListHeaderComponent={filteredStudents.length === 0 ? null : null}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View
              className="rounded-2xl p-8 items-center justify-center"
              style={{
                backgroundColor: cardColor,
                borderColor,
                borderWidth: 1,
              }}
            >
              <Ionicons name="search" size={40} color={mutedColor} />
              <Text
                className="text-base mt-3 text-center"
                style={{ color: mutedColor }}
              >
                {t("noStudentsFoundWithFilters")}
              </Text>
            </View>
          }
          renderItem={({ item: student }) => {
            // Use the ranking from the API response (stored in student.id)
            const rank = student.id;
            const canClickStudent =
              user?.role === "teacher" || user?.role === "admin";
            const isChild = isChildOfParent(student.student_id);

            const cardContent = (
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
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: textColor }}
                    >
                      {student.name}
                    </Text>
                    {/* Child badge for parent view */}
                    {isChild && (
                      <View
                        className="ml-2 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${primaryColor}30` }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: primaryColor }}
                        >
                          {t("myChild")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row mt-1">
                    <Text className="text-sm" style={{ color: mutedColor }}>
                      {student.grade} • {student.section}
                    </Text>
                  </View>
                </View>

                {/* Points */}
                <View className="items-end">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    {student.points}
                  </Text>
                  <Text className="text-xs" style={{ color: mutedColor }}>
                    {t("disciplinePoints")}
                  </Text>
                </View>
              </View>
            );

            return canClickStudent ? (
              <TouchableOpacity
                className="rounded-2xl p-4 mb-3 border shadow-sm"
                style={{
                  backgroundColor: cardColor,
                  borderColor,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  ...getChildHighlightStyle(student.student_id),
                }}
                onPress={() => {
                  router.push(
                    `/student-details?studentId=${student.student_id}`
                  );
                }}
              >
                {cardContent}
              </TouchableOpacity>
            ) : (
              <View
                className="rounded-2xl p-4 mb-3 border shadow-sm"
                style={{
                  backgroundColor: cardColor,
                  borderColor,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  ...getChildHighlightStyle(student.student_id),
                }}
              >
                {cardContent}
              </View>
            );
          }}
        />
      ) : students.length === 0 ? (
        <View className="flex-1 px-5">
          <View
            className="rounded-2xl p-8 items-center justify-center"
            style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
          >
            <Ionicons name="alert-circle" size={40} color={mutedColor} />
            <Text
              className="text-base mt-3 text-center"
              style={{ color: mutedColor }}
            >
              {t("noDisciplineLeaderboardDataAvailable")}
            </Text>
            <Text
              className="text-sm mt-2 text-center"
              style={{ color: mutedColor }}
            >
              {t("tryRefreshingOrCheckConnection")}
            </Text>
          </View>
        </View>
      ) : null}
      
      {/* Grade Dropdown Modal */}
      <Modal
        transparent={true}
        visible={gradeDropdownOpen}
        animationType="fade"
        onRequestClose={() => setGradeDropdownOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setGradeDropdownOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-5">
            <View
              className="rounded-2xl p-4 w-full max-h-[80%]"
              style={{ backgroundColor: cardColor }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  {t("selectGrade")}
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
                      handleGradeChange(item);
                      setGradeDropdownOpen(false);
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{
                        color:
                          selectedGrade === item ? primaryColor : textColor,
                        fontWeight: selectedGrade === item ? "600" : "400",
                      }}
                    >
                      {item === ALL_GRADES ? t("allGrades") : item}
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
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setSectionDropdownOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-5">
            <View
              className="rounded-2xl p-4 w-full max-h-[80%]"
              style={{ backgroundColor: cardColor }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  {t("selectSection")}
                </Text>
                <TouchableOpacity onPress={() => setSectionDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color={mutedColor} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableSectionsForGrade}
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
                        color:
                          selectedSection === item ? primaryColor : textColor,
                        fontWeight: selectedSection === item ? "600" : "400",
                      }}
                    >
                      {item === ALL_SECTIONS ? t("allSections") : item}
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