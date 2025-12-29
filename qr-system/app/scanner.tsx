import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Vibration } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Student } from "../api/studentApi";
import CameraViewComponent from "../components/CameraView";
import ModalManager from "../components/ModalManager";
import DebugPanel from "../components/DebugPanel";
import { useQRScanner } from "../hooks/useQRScanner";
import { useStudentData } from "../hooks/useStudentData";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { CanScan } from "../components/RoleBasedUI";


export default function scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [qrData, setQrData] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSahsiahForm, setShowSahsiahForm] = useState(false);
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const { isScanning, cooldown, handleBarcodeScanned, resetScanner } = useQRScanner();
  const {
    loading,
    sahsiahCount,
    disciplineCount,
    handleAttendance,
    handleRMT,
    handleSahsiah,
    handleDiscipline,
    getStudentActions,
    resetCounts,
  } = useStudentData();

  // Handle successful QR scan
  const handleScanSuccess = useCallback((scannedStudent: Student) => {
    setQrData(scannedStudent.id);
    setStudent(scannedStudent);
    setShowStudentModal(true);
    setShowSahsiahForm(false);
    setShowDisciplineForm(false);
    // Reset sahsiah and discipline count for new student
    resetCounts();
  }, [resetCounts]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const closeModal = useCallback(() => {
    setShowStudentModal(false);
    setShowSahsiahForm(false);
    setShowDisciplineForm(false);
    setStudent(null);
    setQrData(null);
    // Resume scanning after modal close
    setTimeout(() => {
      resetScanner();
    }, 500);
  }, [resetScanner]);

  const closeAllAndReturnToScanner = useCallback(() => {
    setShowStudentModal(false);
    setShowSahsiahForm(false);
    setShowDisciplineForm(false);
    setStudent(null);
    setQrData(null);
    // Resume scanning immediately
    resetScanner();
  }, [resetScanner]);

  const handleOpenSahsiahForm = useCallback(() => {
    setShowStudentModal(false); // Close the student modal first
    setShowSahsiahForm(true);
  }, []);

  const handleOpenDisciplineForm = useCallback(() => {
    setShowStudentModal(false); // Close the student modal first
    setShowDisciplineForm(true);
  }, []);

  const handleBackFromSahsiah = useCallback(() => {
    setShowSahsiahForm(false);
    setShowStudentModal(true); // Reopen the student modal when going back
  }, []);

  const handleBackFromDiscipline = useCallback(() => {
    setShowDisciplineForm(false);
    setShowStudentModal(true); // Reopen the student modal when going back
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </SafeAreaView>
    );
  }

  const studentActions = student
    ? getStudentActions(student.id)
    : {
        attendance: false,
        rmt: false,
        sahsiah: false,
        discipline: false,
      };

  // Check if all actions are completed for the current student
  // Note: Sahsiah can be recorded multiple times, so we don't include it in the completion check
  // RMT is only required if student is eligible
  const allActionsCompleted = Boolean(
    student &&
      studentActions.attendance &&
      (!student.eligible_rmt || studentActions.rmt)
  );

  return (
    <ProtectedRoute
      allowedRoles={['admin', 'teacher']}
      showAccessDeniedMessage={true}
    >
      <SafeAreaView style={styles.container}>
        <CameraViewComponent
          facing={facing}
          isActive={isScanning}
          onBarcodeScanned={(result) => handleBarcodeScanned(result, handleScanSuccess)}
          onToggleCamera={toggleCameraFacing}
        />

        {/* Debug button - positioned in top-right corner */}
        <CanScan>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setShowDebugPanel(true)}
          >
            <Ionicons name="bug" size={24} color="white" />
          </TouchableOpacity>
        </CanScan>

        <ModalManager
          student={student}
          actions={studentActions}
          loading={loading}
          allActionsCompleted={allActionsCompleted}
          sahsiahCount={sahsiahCount}
          disciplineCount={disciplineCount}
          showStudentModal={showStudentModal}
          showSahsiahForm={showSahsiahForm}
          showDisciplineForm={showDisciplineForm}
          onClose={closeModal}
          onAttendance={handleAttendance}
          onRMT={handleRMT}
          onSahsiah={async (student, sahsiahType, notes) => {
            const success = await handleSahsiah(student, sahsiahType, notes);
            return success || false;
          }}
          onDiscipline={async (student, disciplineType, notes) => {
            const success = await handleDiscipline(student, disciplineType, notes);
            return success || false;
          }}
          onOpenSahsiahForm={handleOpenSahsiahForm}
          onOpenDisciplineForm={handleOpenDisciplineForm}
          onBackFromSahsiah={handleBackFromSahsiah}
          onBackFromDiscipline={handleBackFromDiscipline}
          onFormSubmit={closeAllAndReturnToScanner}
        />

        <DebugPanel
          visible={showDebugPanel}
          onClose={() => setShowDebugPanel(false)}
        />
      </SafeAreaView>
    </ProtectedRoute>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    fontSize: 16,
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
    zIndex: 100,
  },
});
