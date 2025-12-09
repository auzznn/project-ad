import { Button, View, Text, StyleSheet, Vibration, TouchableOpacity, Alert, Dimensions, Alert as RNAlert } from 'react-native'
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, studentApi } from '../api/studentApi';
import StudentModal from '../components/StudentModal';
import SahsiahForm from '../components/SahsiahForm';

interface StudentActions {
  attendance: boolean;
  rmt: boolean;
  sahsiah: boolean;
}

interface LoadingStates {
  attendance: boolean;
  rmt: boolean;
  sahsiah: boolean;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function scanner() {
  const [permission, requestPermission] = useCameraPermissions()
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [qrData, setQrData] = useState<string | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showSahsiahForm, setShowSahsiahForm] = useState(false)
  const [lastScan, setLastScan] = useState("")
  const [cooldown, setCooldown] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [actionsMap, setActionsMap] = useState<Record<string, StudentActions>>({})
  const [loading, setLoading] = useState<LoadingStates>({
    attendance: false,
    rmt: false,
    sahsiah: false
  })
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info'
  })
  const [sahsiahCount, setSahsiahCount] = useState(0)
  
  // Get screen dimensions for scan area calculation
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scanAreaSize = 250; // Size of the square scanning area
  const scanAreaBounds = {
    x: (screenWidth - scanAreaSize) / 2,
    y: (screenHeight - scanAreaSize) / 2,
    width: scanAreaSize,
    height: scanAreaSize
  };

  // Load persisted actions on component mount
  useEffect(() => {
    loadPersistedActions();
  }, []);

  // Function to load persisted actions from AsyncStorage
  const loadPersistedActions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const lastResetDate = await AsyncStorage.getItem('last_actions_reset_date');
      
      // If this is a new day, clear yesterday's actions
      if (lastResetDate !== today) {
        // Clear old actions
        const keys = await AsyncStorage.getAllKeys();
        const actionKeys = keys.filter(key => key.startsWith('student_actions_') && key !== `student_actions_${today}`);
        if (actionKeys.length > 0) {
          await AsyncStorage.multiRemove(actionKeys);
        }
        
        // Update the last reset date
        await AsyncStorage.setItem('last_actions_reset_date', today);
      }
      
      // Load today's actions
      const storedActions = await AsyncStorage.getItem(`student_actions_${today}`);
      
      if (storedActions) {
        const parsedActions = JSON.parse(storedActions);
        setActionsMap(parsedActions);
      }
    } catch (error) {
      console.error('Failed to load persisted actions:', error);
    }
  };

  // Function to persist actions to AsyncStorage
  const persistActions = async (updatedActions: Record<string, StudentActions>) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      await AsyncStorage.setItem(`student_actions_${today}`, JSON.stringify(updatedActions));
    } catch (error) {
      console.error('Failed to persist actions:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
    // Show alert instead of toast for guaranteed visibility
    RNAlert.alert(
      type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      message,
      [{ text: 'OK', onPress: () => {} }]
    );
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const getStudentActions = (studentId: string): StudentActions => {
    return actionsMap[studentId] || {
      attendance: false,
      rmt: false,
      sahsiah: false
    };
  };

  const updateStudentAction = (studentId: string, action: keyof StudentActions, completed: boolean) => {
    setActionsMap(prev => {
      const updatedActions = {
        ...prev,
        [studentId]: {
          ...getStudentActions(studentId),
          [action]: completed
        }
      };
      
      // Persist the updated actions immediately
      persistActions(updatedActions);
      
      return updatedActions;
    });
  };

  const parseStudentQR = (qrData: string): Student | null => {
    try {
      // Parse JSON format QR code
      const parsed = JSON.parse(qrData);
      return {
        student_id: parsed.student_id,
        name: parsed.name,
        program: parsed.program,
        eligible_rmt: parsed.eligible_rmt,
        timestamp: parsed.timestamp
      };
    } catch (error) {
      // Fallback to STD format: STD:id:name:grade:class:eligible_rmt
      if (qrData.startsWith('STD:')) {
        const parts = qrData.split(':');
        if (parts.length === 6) {
          // New format with eligible_rmt
          return {
            student_id: parts[1],
            name: parts[2],
            program: parts[4], // Using class as program since that's what's available
            eligible_rmt: parts[5] === 'true', // Convert string to boolean
            timestamp: new Date().toISOString()
          };
        } else if (parts.length === 5) {
          // Old format without eligible_rmt
          return {
            student_id: parts[1],
            name: parts[2],
            program: parts[3],
            eligible_rmt: false, // Default to false for old format
            timestamp: new Date().toISOString()
          };
        }
      }
      return null;
    }
  };

  const handleBarcodeScanned = useCallback((scanningResult: any) => {
    if (!isCameraActive) return;
    
    // Prevent duplicate scans within cooldown period
    if (cooldown) return;
    
    const { type, data } = scanningResult;
    
    console.log('QR Scanned:', { data });
    
    // Allow scanning the same QR code again after cooldown period
    setLastScan(data);
    setCooldown(true);
    
    // Reset cooldown after 2 seconds to prevent accidental double scans
    setTimeout(() => setCooldown(false), 2000);
    
    // Vibrate to indicate successful scan
    Vibration.vibrate(100);
    
    // Parse QR data
    const parsedStudent = parseStudentQR(data);
    if (parsedStudent) {
      setQrData(data);
      setStudent(parsedStudent);
      setIsCameraActive(false);
      setShowStudentModal(true);
      setShowSahsiahForm(false);
      // Reset sahsiah count for new student
      setSahsiahCount(0);
    } else {
      showToast('Invalid QR Code. This is not a valid student QR code.', 'error');
    }
  }, [isCameraActive, cooldown]);

  const handleAttendance = () => {
    if (!student) return;
    
    setLoading(prev => ({ ...prev, attendance: true }));
    
    // Only update local state, no backend call
    setTimeout(() => {
      updateStudentAction(student.student_id, 'attendance', true);
      showToast('Attendance recorded', 'success');
      setLoading(prev => ({ ...prev, attendance: false }));
    }, 300);
  };

  const handleRMT = () => {
    if (!student) return;
    
    setLoading(prev => ({ ...prev, rmt: true }));
    
    // Always show toast based on QR data, regardless of other actions
    if (student.eligible_rmt) {
      showToast('Eligible for RMT', 'success');
    } else {
      showToast('Not eligible for RMT', 'error');
    }
    
    // Update state immediately after showing toast
    updateStudentAction(student.student_id, 'rmt', true);
    setLoading(prev => ({ ...prev, rmt: false }));
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
   * @param deedType - The type of good deed performed
   * @param notes - Optional notes about the good deed
   * @param points - Points awarded for this good deed
   */
  const handleSahsiah = async (deedType: string, notes: string, points?: number) => {
    if (!student) return;
    
    setLoading(prev => ({ ...prev, sahsiah: true }));
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      
      // Create comprehensive sahsiah record with all student data
      // This ensures we have complete information for the leaderboard and reporting
      const sahsiahKey = `sahsiah_${student.student_id}_${today}_${timestamp}`;
      const sahsiahData = {
        student_id: student.student_id,
        student_name: student.name,
        program: student.program,
        eligible_rmt: student.eligible_rmt,
        deed_type: deedType,
        notes: notes,
        points: points || 0, // Points will be determined in SahsiahForm
        timestamp: timestamp
      };
      
      // Store the sahsiah record for historical tracking
      await AsyncStorage.setItem(sahsiahKey, JSON.stringify(sahsiahData));
      
      // Update student points if points are provided
      if (points && points > 0) {
        // Update the student's total and daily points
        await updateStudentPoints(student.student_id, points);
        
        // Add to today's deeds list for leaderboard display
        // This ensures the leaderboard shows the most recent activities
        await updateTodayDeeds(student.student_id, student.name, student.program, deedType, points, timestamp);
        
        // Update class statistics for reporting and analytics
        await updateClassStatistics(student.program, points);
      }
      
      // Increment sahsiah count for this student (for UI display)
      setSahsiahCount(prev => prev + 1);
      
      // Mark sahsiah action as completed for today
      // This prevents duplicate recordings and tracks daily progress
      updateStudentAction(student.student_id, 'sahsiah', true);
      
      showToast('Good deed recorded successfully', 'success');
      setShowSahsiahForm(false);
    } catch (error) {
      showToast('Failed to record good deed', 'error');
      console.error('Sahsiah error:', error);
    } finally {
      setLoading(prev => ({ ...prev, sahsiah: false }));
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
   * @param points - Points to add (positive number)
   */
  const updateStudentPoints = async (studentId: string, points: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `student_points_${studentId}`;
      const existingData = await AsyncStorage.getItem(key);
      
      // Initialize or load existing student points data
      let studentPoints = existingData ? JSON.parse(existingData) : {
        totalPoints: 0,
        dailyPoints: {},
        lastUpdated: null
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
      console.log(`Updated ${studentId} points: +${points}, Total: ${studentPoints.totalPoints}`);
    } catch (error) {
      console.error('Error updating student points:', error);
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
  const updateTodayDeeds = async (studentId: string, studentName: string, program: string, deedName: string, points: number, timestamp: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
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
        timestamp
      });
      
      // Save updated deeds list
      await AsyncStorage.setItem(key, JSON.stringify(deedsList));
      console.log(`Added to today's deeds: ${studentName} - ${deedName} (+${points} points)`);
    } catch (error) {
      console.error('Error updating today\'s deeds:', error);
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
  const updateClassStatistics = async (className: string, points: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `class_stats_${className}_${today}`;
      const existingStats = await AsyncStorage.getItem(key);
      
      // Load existing stats or initialize new structure
      let classStats = existingStats ? JSON.parse(existingStats) : {
        totalPoints: 0,
        deedCount: 0,
        topStudents: []
      };
      
      // Update class statistics
      classStats.totalPoints += points;
      classStats.deedCount += 1;
      
      // Save updated statistics
      await AsyncStorage.setItem(key, JSON.stringify(classStats));
      console.log(`Updated class stats for ${className}: +${points} points, ${classStats.deedCount} deeds`);
    } catch (error) {
      console.error('Error updating class statistics:', error);
    }
  };

  const handleOpenSahsiahForm = () => {
    setShowStudentModal(false); // Close the student modal first
    setShowSahsiahForm(true);
  };

  const handleBackFromSahsiah = () => {
    setShowSahsiahForm(false);
    setShowStudentModal(true); // Reopen the student modal when going back
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setShowSahsiahForm(false);
    setStudent(null);
    setQrData(null);
    // Resume scanning after modal close
    setTimeout(() => {
      setIsCameraActive(true);
    }, 500);
  };

  const closeAllAndReturnToScanner = () => {
    setShowStudentModal(false);
    setShowSahsiahForm(false);
    setStudent(null);
    setQrData(null);
    // Resume scanning immediately
    setIsCameraActive(true);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const studentActions = student ? getStudentActions(student.student_id) : {
    attendance: false,
    rmt: false,
    sahsiah: false
  };
  
  // Check if all actions are completed for the current student
  // Note: Sahsiah can be recorded multiple times, so we don't include it in the completion check
  const allActionsCompleted = Boolean(student &&
    studentActions.attendance &&
    studentActions.rmt);

  return (
    <SafeAreaView style={styles.container}>
        {/* Main content container */}
        <View style={styles.mainContent}>
          {/* Camera container - just the square viewfinder */}
          <View style={[styles.cameraContainer, {
            width: scanAreaSize,
            height: scanAreaSize,
          }]}>
            <CameraView
              style={styles.camera}
              facing={facing}
              onBarcodeScanned={isCameraActive ? handleBarcodeScanned : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            
            {/* Scan frame overlay */}
            <View style={[styles.scanFrame, {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderColor: isCameraActive ? '#4CAF50' : 'white'
            }]} />
          </View>
          
          {/* Instructions */}
          {isCameraActive && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>Position QR code within the frame to scan</Text>
            </View>
          )}
        </View>
        
        {/* Camera flip button */}
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>

        {/* Student Modal */}
        <StudentModal
          visible={showStudentModal}
          student={student}
          actions={studentActions}
          loading={loading}
          allActionsCompleted={allActionsCompleted}
          sahsiahCount={sahsiahCount}
          onClose={closeModal}
          onAttendance={handleAttendance}
          onRMT={handleRMT}
          onSahsiah={handleSahsiah}
          onOpenSahsiahForm={handleOpenSahsiahForm}
        />

        {/* Sahsiah Form as a separate overlay */}
        {showSahsiahForm && student && (
          <View style={styles.sahsiahFormOverlay}>
            <SahsiahForm
              student={student}
              onSubmit={async (deedType, notes, points) => {
                await handleSahsiah(deedType, notes, points);
                closeAllAndReturnToScanner();
              }}
              onCancel={handleBackFromSahsiah}
              loading={loading.sahsiah}
            />
          </View>
        )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  instructionContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  flipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 25,
  },
  sahsiahFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
});