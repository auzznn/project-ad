// Test script to verify the attendance date fix
// This script can be run in a React Native debugger console

import AsyncStorage from '@react-native-async-storage/async-storage';

// Test function to verify KL timezone date calculation
const testKLDateCalculation = () => {
  console.log('Testing KL timezone date calculation...');
  
  // Simulate the getKLToday function
  const getKLToday = () => {
    const now = new Date();
    const klOffset = 8 * 60; // 8 hours in minutes
    const localOffset = now.getTimezoneOffset(); // Local offset in minutes (negative for UTC+)
    const adjustedTime = new Date(now.getTime() + (localOffset + klOffset) * 60000);
    return adjustedTime.toISOString().split("T")[0];
  };
  
  const today = getKLToday();
  const localDate = new Date().toISOString().split("T")[0];
  
  console.log('Local date:', localDate);
  console.log('KL date:', today);
  console.log('Dates match:', localDate === today);
  
  return { today, localDate, match: localDate === today };
};

// Test function to clear attendance data
const testClearAttendanceData = async () => {
  console.log('Testing clear attendance data...');
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    const attendanceKeys = keys.filter(
      (key) =>
        key.startsWith("student_actions_") ||
        key === "last_actions_reset_date"
    );
    
    console.log('Found attendance keys:', attendanceKeys);
    
    if (attendanceKeys.length > 0) {
      await AsyncStorage.multiRemove(attendanceKeys);
      console.log(`Cleared ${attendanceKeys.length} attendance-related keys`);
    }
    
    // Set the reset date to today in KL timezone
    const getKLToday = () => {
      const now = new Date();
      const klOffset = 8 * 60;
      const localOffset = now.getTimezoneOffset();
      const adjustedTime = new Date(now.getTime() + (localOffset + klOffset) * 60000);
      return adjustedTime.toISOString().split("T")[0];
    };
    
    await AsyncStorage.setItem("last_actions_reset_date", getKLToday());
    console.log('Set reset date to:', getKLToday());
    
    return true;
  } catch (error) {
    console.error("Failed to clear attendance data:", error);
    return false;
  }
};

// Test function to verify attendance status checking
const testAttendanceStatusCheck = async (studentId) => {
  console.log('Testing attendance status check for student:', studentId);
  
  // This would need to be called from within the app context
  // where the API is available
  try {
    // Simulate API call
    const response = await fetch('/student_attendance/daily');
    const data = await response.json();
    
    const studentRecords = data.filter((record) =>
      record.student_id === studentId &&
      record.updated_at && record.updated_at !== record.created_at
    );
    
    console.log('Student attendance records:', studentRecords);
    console.log('Has attendance today:', studentRecords.length > 0);
    
    return studentRecords.length > 0;
  } catch (error) {
    console.error('Failed to check attendance status:', error);
    return false;
  }
};

// Export test functions for use in debugger
export {
  testKLDateCalculation,
  testClearAttendanceData,
  testAttendanceStatusCheck
};

// Instructions for testing
console.log(`
To test the attendance fix:

1. Run testKLDateCalculation() to verify date calculation
2. Run testClearAttendanceData() to clear local storage
3. Try recording attendance for a student
4. If issues persist, check the backend logs for timezone issues

The fix ensures that:
- Local storage uses KL timezone consistently
- Attendance data can be cleared when needed
- Date mismatches are handled gracefully
`);