import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student, AttendancePayload } from "../api/studentApi";
import { useStudentActions, StudentActions } from "./useStudentActions";
import {
  updateTodayViolations,
  updateStudentPoints,
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
  const { updateStudentAction, getStudentActions } = useStudentActions();
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

    try {
      // Fetch today's attendance record
      const record = await studentApi.checkAttendanceStatus(student.student_id);

      // Check if student already has attendance and is not absent
      if (record && record.status !== "absent") {
        showAlert("Attendance already marked", "info");
        return;
      }

      // Mark attendance
      const attendancePayload: AttendancePayload = {
        student_id: student.student_id,
        timestamp: new Date().toISOString(),
      };

      await studentApi.markAttendance(attendancePayload);

      showAlert("Attendance recorded", "success");
    } catch (error: any) {
      showAlert(
        error.response?.data?.message ||
          error.message ||
          "Failed to record attendance",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, attendance: false }));
    }
  };

  /**
   * Check if attendance button should be disabled for a student
   * @param studentId - The student ID to check
   * @returns Promise<boolean> - True if button should be disabled, false if enabled
   */
  const canMarkAttendance = async (studentId: string): Promise<boolean> => {
    try {
      const record = await studentApi.checkAttendanceStatus(studentId);
      // If no record exists or status is "absent", allow marking (return true)
      // If record exists and status is not "absent", disable button (return false)
      return !record || record.status === "absent";
    } catch (error) {
      // Default to allowing marking if there's an error
      return true;
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
   * This function makes an API call to record the sahsiah data
   *
   * @param student - The student object
   * @param sahsiahType - The ID of the sahsiah type (integer)
   * @param notes - Optional notes about the good deed
   */
  const handleSahsiah = async (
    student: Student,
    sahsiahType: number,
    notes: string
  ): Promise<boolean> => {
    if (!student) return false;

    setLoading((prev) => ({ ...prev, sahsiah: true }));
    try {
      const timestamp = new Date().toISOString();

      // Create sahsiah record for API
      const sahsiahRecord = {
        timestamp: timestamp,
        student_id: parseInt(student.student_id),
        sahsiah_type: sahsiahType,
      };

      // Post sahsiah record to API
      await studentApi.recordSahsiah(sahsiahRecord);

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
    canMarkAttendance,
  };
};
