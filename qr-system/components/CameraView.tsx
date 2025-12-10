import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

interface CameraViewProps {
  facing: "back" | "front";
  isActive: boolean;
  onBarcodeScanned: (result: any) => void;
  onToggleCamera: () => void;
}

const CameraViewComponent: React.FC<CameraViewProps> = ({
  facing,
  isActive,
  onBarcodeScanned,
  onToggleCamera,
}) => {
  // Get screen dimensions for scan area calculation
  const { width: screenWidth } = Dimensions.get("window");
  const scanAreaSize = 250; // Size of the square scanning area

  return (
    <View style={styles.mainContent}>
      {/* Camera container - just the square viewfinder */}
      <View
        style={[
          styles.cameraContainer,
          {
            width: scanAreaSize,
            height: scanAreaSize,
          },
        ]}
      >
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={isActive ? onBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Scan frame overlay */}
        <View
          style={[
            styles.scanFrame,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderColor: isActive ? "#4CAF50" : "white",
            },
          ]}
        />
      </View>

      {/* Instructions */}
      {isActive && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Position QR code within the frame to scan
          </Text>
        </View>
      )}

      {/* Camera flip button */}
      <TouchableOpacity style={styles.flipButton} onPress={onToggleCamera}>
        <Ionicons name="camera-reverse" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#4CAF50",
    shadowColor: "#000",
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
    borderColor: "#4CAF50",
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  instructionContainer: {
    marginTop: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  flipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 25,
  },
});

export default CameraViewComponent;