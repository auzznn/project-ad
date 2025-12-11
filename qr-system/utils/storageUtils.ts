import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Updates today's violations list for display
 * This creates a chronological list of all discipline violations recorded today
 *
 * Storage Structure:
 * Key: today_violations_YYYY-MM-DD
 * Value: Array of {
 *   studentId: string,
 *   studentName: string,
 *   program: string,
 *   violationName: string,
 *   points: number, // negative number
 *   timestamp: string
 * }
 *
 * This data can be used for reporting and tracking discipline issues
 *
 * @param studentId - The student's ID
 * @param studentName - The student's name
 * @param program - The student's program/class
 * @param violationName - Name of the discipline violation
 * @param points - Points to deduct for the violation (negative number)
 * @param timestamp - ISO timestamp of when the violation was recorded
 */
export const updateTodayViolations = async (
  studentId: string,
  studentName: string,
  program: string,
  violationName: string,
  points: number,
  timestamp: string
) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `today_violations_${today}`;
    const existingViolations = await AsyncStorage.getItem(key);

    // Load existing violations or initialize empty array
    let violationsList = existingViolations
      ? JSON.parse(existingViolations)
      : [];

    // Add new violation to the list
    violationsList.push({
      studentId,
      studentName,
      program,
      violationName,
      points, // This will be a negative number
      timestamp,
    });

    // Save updated violations list
    await AsyncStorage.setItem(key, JSON.stringify(violationsList));
    console.log(
      `Added to today's violations: ${studentName} - ${violationName} (${points} points)`
    );
  } catch (error) {
    console.error("Error updating today's violations:", error);
  }
};

/**
 * Updates student points in AsyncStorage
 * Maintains both total points and daily points for each student
 *
 * Storage Structure:
 * Key: student_points_{studentId}
 * Value: {
 *   totalPoints: number,        // Cumulative points across all time
 *   dailyPoints: {              // Daily breakdown of points
 *     "YYYY-MM-DD": number
 *   },
 *   lastUpdated: string          // ISO timestamp of last update
 * }
 *
 * @param studentId - The student's ID
 * @param points - Points to add (can be positive for good deeds or negative for discipline)
 */
export const updateStudentPoints = async (studentId: string, points: number) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `student_points_${studentId}`;
    const existingData = await AsyncStorage.getItem(key);

    // Initialize or load existing student points data
    let studentPoints = existingData
      ? JSON.parse(existingData)
      : {
          totalPoints: 0,
          dailyPoints: {},
          lastUpdated: null,
        };

    // Update cumulative total points
    studentPoints.totalPoints += points;

    // Update daily points (creates new entry if doesn't exist)
    if (!studentPoints.dailyPoints[today]) {
      studentPoints.dailyPoints[today] = 0;
    }
    studentPoints.dailyPoints[today] += points;

    // Update timestamp for tracking
    studentPoints.lastUpdated = new Date().toISOString();

    // Save updated points data
    await AsyncStorage.setItem(key, JSON.stringify(studentPoints));
    const sign = points >= 0 ? "+" : "";
    console.log(
      `Updated ${studentId} points: ${sign}${points}, Total: ${studentPoints.totalPoints}`
    );
  } catch (error) {
    console.error("Error updating student points:", error);
  }
};

/**
 * Updates today's deeds list for leaderboard display
 * This creates a chronological list of all good deeds performed today
 *
 * Storage Structure:
 * Key: today_deeds_YYYY-MM-DD
 * Value: Array of {
 *   studentId: string,
 *   studentName: string,
 *   program: string,
 *   deedName: string,
 *   points: number,
 *   timestamp: string
 * }
 *
 * This data is used by the leaderboard to show recent activities and
 * ensure all students with deeds are displayed, even if they have 0 points
 *
 * @param studentId - The student's ID
 * @param studentName - The student's name
 * @param program - The student's program/class
 * @param deedName - Name of the good deed performed
 * @param points - Points awarded for the deed
 * @param timestamp - ISO timestamp of when the deed was recorded
 */
export const updateTodayDeeds = async (
  studentId: string,
  studentName: string,
  program: string,
  deedName: string,
  points: number,
  timestamp: string
) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `today_deeds_${today}`;
    const existingDeeds = await AsyncStorage.getItem(key);

    // Load existing deeds or initialize empty array
    let deedsList = existingDeeds ? JSON.parse(existingDeeds) : [];

    // Add new deed to the list
    deedsList.push({
      studentId,
      studentName,
      program,
      deedName,
      points,
      timestamp,
    });

    // Save updated deeds list
    await AsyncStorage.setItem(key, JSON.stringify(deedsList));
    console.log(
      `Added to today's deeds: ${studentName} - ${deedName} (+${points} points)`
    );
  } catch (error) {
    console.error("Error updating today's deeds:", error);
  }
};

/**
 * Updates class statistics for reporting and analytics
 * Tracks total points and deed count for each class per day
 *
 * Storage Structure:
 * Key: class_stats_{className}_YYYY-MM-DD
 * Value: {
 *   totalPoints: number,     // Total points earned by the class today
 *   deedCount: number,       // Number of deeds performed by the class today
 *   topStudents: string[]    // Array of top performing student IDs (for future use)
 * }
 *
 * This data can be used for class-level reporting and competitions
 *
 * @param className - The name of the class/program
 * @param points - Points to add to the class total
 */
export const updateClassStatistics = async (className: string, points: number) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `class_stats_${className}_${today}`;
    const existingStats = await AsyncStorage.getItem(key);

    // Load existing stats or initialize new structure
    let classStats = existingStats
      ? JSON.parse(existingStats)
      : {
          totalPoints: 0,
          deedCount: 0,
          topStudents: [],
        };

    // Update class statistics
    classStats.totalPoints += points;
    classStats.deedCount += 1;

    // Save updated statistics
    await AsyncStorage.setItem(key, JSON.stringify(classStats));
    const sign = points >= 0 ? "+" : "";
    console.log(
      `Updated class stats for ${className}: ${sign}${points} points, ${classStats.deedCount} deeds`
    );
  } catch (error) {
    console.error("Error updating class statistics:", error);
  }
};