import { useState } from "react";
import { Alert } from "react-native";
import { Student, AttendancePayload } from "../api/studentApi";
import { useStudentActions, StudentActions } from "./useStudentActions";
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

    try {
      // Fetch today's attendance record
      const record = await studentApi.checkAttendanceStatus(student.id);

      // Check if student already has attendance and is not absent
      if (record && record.status !== "absent") {
        showAlert("Attendance already marked", "info");
        return;
      }

      // Mark attendance
      const attendancePayload: AttendancePayload = {
        id: student.id,
        timestamp: new Date().toISOString(),
      };

      const response = await studentApi.markAttendance(attendancePayload);

      // Extract status and timestamp from response
      const status = response.status || "unknown";
      const timestamp = response.timestamp || new Date().toISOString();
      
      // Format timestamp for display
      const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Capitalize the first letter of status
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
      
      showAlert(`Attendance recorded at ${formattedTime}\nStatus: ${formattedStatus}`, "success");
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

  const handleRMT = async (student: Student) => {
    if (!student) return;

    setLoading((prev) => ({ ...prev, rmt: true }));

    try {
      // Fetch today's RMT record (created daily at 00:00 by celery worker)
      const record = await studentApi.checkRMTStatus(student.id);

      // Check if student already has RMT recorded for today (is_present is true)
      if (record && record.is_present) {
        showAlert("RMT already recorded today", "info");
        return;
      }

      // Record RMT
      const rmtPayload = {
        student_id: student.id,
        timestamp: new Date().toISOString(),
      };

      const response = await studentApi.recordRMT(rmtPayload);

      // Extract timestamp from response
      const timestamp = response.timestamp || new Date().toISOString();
      
      // Format timestamp for display
      const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      showAlert(`RMT recorded at ${formattedTime}`, "success");
      
      // Update state after successful recording
      updateStudentAction(student.id, "rmt", true);
    } catch (error: any) {
      showAlert(
        error.response?.data?.message ||
          error.message ||
          "Failed to record RMT",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, rmt: false }));
    }
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
        migrate_student_id: parseInt(student.id),
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
    disciplineType: number,
    notes: string
  ): Promise<boolean> => {
    if (!student) return false;

    setLoading((prev) => ({ ...prev, discipline: true }));
    try {
      const timestamp = new Date().toISOString();

      // Create discipline record for API with exact payload structure
      const disciplineRecord = {
        timestamp: timestamp,
        student_id: parseInt(student.id),
        discipline_type: disciplineType,
      };

      // Post discipline record to API
      await studentApi.recordDiscipline(disciplineRecord);

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
