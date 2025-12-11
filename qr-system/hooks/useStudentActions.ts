import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StudentActions {
  attendance: boolean;
  rmt: boolean;
  sahsiah: boolean;
  discipline: boolean;
}

export const useStudentActions = () => {
  const [actionsMap, setActionsMap] = useState<Record<string, StudentActions>>({});

  // Function to get current date in KL timezone
  const getKLToday = () => {
    const now = new Date();
    // KL is UTC+8, so we need to adjust for the device's timezone
    const klOffset = 8 * 60; // 8 hours in minutes
    const localOffset = now.getTimezoneOffset(); // Local offset in minutes (negative for UTC+)
    const adjustedTime = new Date(now.getTime() + (localOffset + klOffset) * 60000);
    return adjustedTime.toISOString().split("T")[0];
  };

  // Function to load persisted actions from AsyncStorage
  const loadPersistedActions = async () => {
    try {
      const today = getKLToday(); // Get today's date in KL timezone (YYYY-MM-DD format)
      const lastResetDate = await AsyncStorage.getItem(
        "last_actions_reset_date"
      );

      // If this is a new day, clear yesterday's actions
      if (lastResetDate !== today) {
        // Clear old actions
        const keys = await AsyncStorage.getAllKeys();
        const actionKeys = keys.filter(
          (key) =>
            key.startsWith("student_actions_") &&
            key !== `student_actions_${today}`
        );
        if (actionKeys.length > 0) {
          await AsyncStorage.multiRemove(actionKeys);
        }

        // Update the last reset date
        await AsyncStorage.setItem("last_actions_reset_date", today);
      }

      // Load today's actions
      const storedActions = await AsyncStorage.getItem(
        `student_actions_${today}`
      );

      if (storedActions) {
        const parsedActions = JSON.parse(storedActions);
        setActionsMap(parsedActions);
      }
    } catch (error) {
      console.error("Failed to load persisted actions:", error);
    }
  };

  // Function to persist actions to AsyncStorage
  const persistActions = async (
    updatedActions: Record<string, StudentActions>
  ) => {
    try {
      const today = getKLToday(); // Get today's date in KL timezone (YYYY-MM-DD format)
      await AsyncStorage.setItem(
        `student_actions_${today}`,
        JSON.stringify(updatedActions)
      );
    } catch (error) {
      console.error("Failed to persist actions:", error);
    }
  };

  // Function to clear all attendance-related data
  const clearAttendanceData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const attendanceKeys = keys.filter(
        (key) =>
          key.startsWith("student_actions_") ||
          key === "last_actions_reset_date"
      );
      
      if (attendanceKeys.length > 0) {
        await AsyncStorage.multiRemove(attendanceKeys);
        console.log(`Cleared ${attendanceKeys.length} attendance-related keys`);
      }
      
      // Reset the actions map to empty state
      setActionsMap({});
      
      // Set the reset date to today in KL timezone
      await AsyncStorage.setItem("last_actions_reset_date", getKLToday());
      
      return true;
    } catch (error) {
      console.error("Failed to clear attendance data:", error);
      return false;
    }
  };

  const getStudentActions = (studentId: string): StudentActions => {
    return (
      actionsMap[studentId] || {
        attendance: false,
        rmt: false,
        sahsiah: false,
        discipline: false,
      }
    );
  };

  const updateStudentAction = (
    studentId: string,
    action: keyof StudentActions,
    completed: boolean
  ) => {
    setActionsMap((prev) => {
      const updatedActions = {
        ...prev,
        [studentId]: {
          ...getStudentActions(studentId),
          [action]: completed,
        },
      };

      // Persist the updated actions immediately
      persistActions(updatedActions);

      return updatedActions;
    });
  };

  // Load persisted actions on hook mount
  useEffect(() => {
    loadPersistedActions();
  }, []);

  return {
    actionsMap,
    getStudentActions,
    updateStudentAction,
    loadPersistedActions,
    clearAttendanceData,
    getKLToday,
  };
};