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

  // Function to load persisted actions from AsyncStorage
  const loadPersistedActions = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
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
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      await AsyncStorage.setItem(
        `student_actions_${today}`,
        JSON.stringify(updatedActions)
      );
    } catch (error) {
      console.error("Failed to persist actions:", error);
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
  };
};