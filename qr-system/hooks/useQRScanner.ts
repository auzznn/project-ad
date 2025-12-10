import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { Student, studentApi } from "../api/studentApi";
import { useAuth } from "./useAuth";
import { API_CONFIG } from "../api/config";

export const useQRScanner = () => {
  const { isAuthenticated } = useAuth();
  const [isScanning, setIsScanning] = useState(true);
  const [cooldown, setCooldown] = useState(false);
  const [errorShown, setErrorShown] = useState(false);

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

  const parseStudentQR = async (qrData: string): Promise<Student | null> => {
    try {
      // Check if QR data is a URL to the user API endpoint
      if (qrData.includes("/api/authentication/user/")) {
        // Extract student ID from the URL
        let correctedUrl = qrData.replace("localhost", API_CONFIG.BASE_URL);

        const urlParts = correctedUrl.split("/");
        const studentId = urlParts[urlParts.length - 1];

        console.log("Fetching student data for ID:", studentId);
        
        // Use the studentApi to fetch student data
        const data = await studentApi.getStudent(studentId);

        console.log("API response data:", data);

        // Validate that required fields exist
        if (!data || data.student_id === undefined) return null;

        return {
          student_id: data.student_id?.toString() || "",
          name: data.name || "",
          class: (data.grade || "") + (data.section || "") || "",
          rmt_elligible: data.rmt_elligible ?? false,
          timestamp: new Date().toISOString(),
        };
      }

      console.warn("QR code is not a recognized URL:", qrData);
      return null;
    } catch (error: any) {
      console.error("Error parsing QR code:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error details:", error.message);
      return null;
    }
  };

  const handleBarcodeScanned = useCallback(
    async (scanningResult: any, onScanSuccess: (student: Student) => void) => {
      if (!isScanning || cooldown) return;

      const { data } = scanningResult;

      console.log("QR Scanned:", { data });

      // Set cooldown to prevent duplicate scans
      setCooldown(true);

      // Reset cooldown after 3 seconds to prevent accidental double scans
      setTimeout(() => setCooldown(false), 3000);

      // Parse QR data
      const parsedStudent = await parseStudentQR(data);
      if (parsedStudent) {
        setIsScanning(false);
        onScanSuccess(parsedStudent);
      } else {
        if (!errorShown) {
          showAlert(
            "Invalid QR Code. This is not a valid student QR code.",
            "error"
          );
          setErrorShown(true);
        }
        setTimeout(() => setCooldown(false), 3000);
      }
    },
    [isScanning, cooldown, parseStudentQR, errorShown]
  );

  const resetScanner = useCallback(() => {
    setIsScanning(true);
    setCooldown(false);
    setErrorShown(false);
  }, []);

  return {
    isScanning,
    cooldown,
    handleBarcodeScanned,
    resetScanner,
    parseStudentQR,
  };
};