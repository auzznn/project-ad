import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student } from "../api/studentApi";
import { useStudentActions, StudentActions } from "./useStudentActions";
import {
  updateTodayViolations,
  updateStudentPoints,
  updateTodayDeeds,
  updateClassStatistics,
} from "../utils/storageUtils";
import { studentApi } from "../api/studentApi";

export interface LoadingStates {
  attendance: boolean;
  rmt: boolean;
  sahsiah: boolean;
  discipline: boolean;
}

export const useStudentData = () => {
  const { updateStudentAction, getStudentActions, clearAttendanceData } = useStudentActions();
  const [loading, setLoading] = useState<LoadingStates>({
    attendance: false,
    rmt: false,
    sahsiah: false,
    discipline: false,
  });
  const [sahsiahCount, setSahsiahCount] = useState(0);
  const [disciplineCount, setDisciplineCount] = useState(0);

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    Alert.alert(
      type === "success" ? "Success" : type === "error" ? "Error" : "Info",
      message,
      [{ text: "OK", onPress: () => {} }]
    );
  };

const handleAttendance = async (student: Student) => {
  if (!student) return;

  setLoading((prev) => ({ ...prev, attendance: true }));
  console.log('DEBUG: Starting attendance process for student:', student.student_id);

  try {
    // First check if student already has attendance for today
    console.log('DEBUG: Checking attendance status for student:', student.student_id);
    const attendanceRecords = await studentApi.checkAttendanceStatus(student.student_id);
    console.log('DEBUG: Attendance records found:', attendanceRecords);
    const hasAttendanceToday = attendanceRecords.length > 0;

    if (hasAttendanceToday) {
      console.log('DEBUG: Attendance already recorded for today');
      showAlert("Attendance already recorded for today", "info");
      return;
    }

    // If no attendance exists, mark it
    console.log('DEBUG: No attendance found, marking attendance now');
    await studentApi.markAttendance(student.student_id);

    // Update local state after success
    updateStudentAction(student.student_id, "attendance", true);
    showAlert("Attendance recorded", "success");
  } catch (error: any) {
    console.error("DEBUG: Failed to mark attendance - Full error:", error);
    console.error("DEBUG: Error response data:", error.response?.data);
    console.error("DEBUG: Error response status:", error.response?.status);
    console.error("DEBUG: Error response headers:", error.response?.headers);
    
    // If the error indicates a date mismatch, offer to clear local data
    if (error.response?.status === 400 &&
        error.response?.data?.message?.includes('already been created')) {
      showAlert(
        "Date mismatch detected. Please try clearing local data and try again.",
        "error"
      );
    } else {
      showAlert(
        error.response?.data?.message || error.message || "Failed to record attendance",
        "error"
      );
    }
  } finally {
    setLoading((prev) => ({ ...prev, attendance: false }));
  }
};

// Function to clear all attendance data
const clearAllAttendanceData = async () => {
  try {
    const success = await clearAttendanceData();
    if (success) {
      showAlert("Local attendance data cleared successfully", "success");
    } else {
      showAlert("Failed to clear local attendance data", "error");
    }
  } catch (error) {
    console.error("Failed to clear attendance data:", error);
    showAlert("Failed to clear local attendance data", "error");
  }
};


  const handleRMT = (student: Student) => {
    if (!student) return;

    setLoading((prev) => ({ ...prev, rmt: true }));

    // This function is only called when student is eligible (button is only shown for eligible students)
    showAlert("Eligible for RMT", "success");

    // Update state immediately after showing alert
    updateStudentAction(student.student_id, "rmt", true);
    setLoading((prev) => ({ ...prev, rmt: false }));
  };

  /**
   * Handles the recording of good deeds (Sahsiah) for students
   * This is the central function that manages the complete data flow from SahsiahForm to storage
   *
   * Data Flow:
   * 1. Receives deed data from SahsiahForm (deedType, notes, points)
   * 2. Creates comprehensive sahsiah record with all student information
   * 3. Stores the record in AsyncStorage for historical tracking
   * 4. Updates student points (total and daily)
   * 5. Updates today's deeds list for leaderboard display
   * 6. Updates class statistics for reporting
   * 7. Marks the sahsiah action as completed for the day
   *
   * @param student - The student object
   * @param deedType - The type of good deed performed
   * @param notes - Optional notes about the good deed
   * @param points - Points awarded for this good deed
   */
  const handleSahsiah = async (
    student: Student,
    sahsiahTypeId: number,
    notes: string,
    points?: number
  ): Promise<boolean> => {
    if (!student) return false;

    setLoading((prev) => ({ ...prev, sahsiah: true }));
    try {
      const timestamp = new Date().toISOString();

      // Create sahsiah record for API with the required format
      const sahsiahRecord = {
        id: 1, // This will be generated by the backend
        timestamp: timestamp,
        student_id: student.student_id,
        sahsiah_type: sahsiahTypeId
      };

      // Post sahsiah record to API
      await studentApi.recordSahsiah(sahsiahRecord);

      // Increment sahsiah count for this student (for UI display)
      setSahsiahCount((prev) => prev + 1);

      // Mark sahsiah action as completed for today
      // This prevents duplicate recordings and tracks daily progress
      updateStudentAction(student.student_id, "sahsiah", true);

      showAlert("Good deed recorded successfully", "success");
      return true;
    } catch (error) {
      showAlert("Failed to record good deed", "error");
      console.error("Sahsiah error:", error);
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, sahsiah: false }));
    }
  };

  /**
   * Handles the recording of discipline violations for students
   * This is the central function that manages the complete data flow from DisciplineForm to storage
   *
   * Data Flow:
   * 1. Receives violation data from DisciplineForm (violationType, notes, points)
   * 2. Creates comprehensive discipline record with all student information
   * 3. Stores the record in AsyncStorage for historical tracking
   * 4. Updates student points (total and daily) - deducting points
   * 5. Updates today's violations list for display
   * 6. Updates class statistics for reporting
   * 7. Marks the discipline action as completed for the day
   *
   * @param student - The student object
   * @param violationType - The type of discipline violation
   * @param notes - Optional notes about the violation
   * @param points - Points to deduct for this violation (negative number)
   */
  const handleDiscipline = async (
    student: Student,
    violationType: string,
    notes: string,
    points?: number
  ): Promise<boolean> => {
    if (!student) return false;

    setLoading((prev) => ({ ...prev, discipline: true }));
    try {
      const today = new Date().toISOString().split("T")[0];
      const timestamp = new Date().toISOString();

      // Create comprehensive discipline record with all student data
      // This ensures we have complete information for reporting and tracking
      const disciplineKey = `discipline_${student.student_id}_${today}_${timestamp}`;
      const disciplineData = {
        student_id: student.student_id,
        student_name: student.name,
        program: student.program,
        eligible_rmt: student.eligible_rmt,
        violation_type: violationType,
        notes: notes,
        points: points || 0, // Points will be determined in DisciplineForm (negative)
        timestamp: timestamp,
      };

      // Store the discipline record for historical tracking
      await AsyncStorage.setItem(disciplineKey, JSON.stringify(disciplineData));

      // Update student points if points are provided (will be negative)
      if (points && points !== 0) {
        // Update the student's total and daily points (deducting)
        await updateStudentPoints(student.student_id, points);

        // Add to today's violations list for display
        // This ensures violations are tracked alongside good deeds
        await updateTodayViolations(
          student.student_id,
          student.name,
          student.program || "Unknown",
          violationType,
          points,
          timestamp
        );

        // Update class statistics for reporting and analytics (negative points)
        await updateClassStatistics(student.program || "Unknown", points);
      }

      // Increment discipline count for this student (for UI display)
      setDisciplineCount((prev) => prev + 1);

      // Mark discipline action as completed for today
      // This prevents duplicate recordings and tracks daily progress
      updateStudentAction(student.student_id, "discipline", true);

      showAlert("Discipline issue recorded successfully", "success");
      return true;
    } catch (error) {
      showAlert("Failed to record discipline issue", "error");
      console.error("Discipline error:", error);
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, discipline: false }));
    }
  };

  const resetCounts = () => {
    setSahsiahCount(0);
    setDisciplineCount(0);
  };

  return {
    loading,
    sahsiahCount,
    disciplineCount,
    handleAttendance,
    handleRMT,
    handleSahsiah,
    handleDiscipline,
    getStudentActions,
    resetCounts,
    clearAllAttendanceData,
  };
};