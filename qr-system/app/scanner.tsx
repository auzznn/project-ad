import { Button, View, Text, StyleSheet, Vibration, TouchableOpacity, Modal } from 'react-native'
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function scanner() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [showModal, setShowModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Reset scanning after a cooldown period
  useEffect(() => {
    if (scannedData && !isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(true)
      }, 3000) // 3 second cooldown
      
      return () => clearTimeout(timer)
    }
  }, [scannedData, isScanning])

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) {
      // Vibrate to indicate successful scan
      Vibration.vibrate(100)
      
      setScannedData(data)
      setIsScanning(false)
      setShowModal(true)
    }
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setShowModal(false)
    // Navigate based on selected option
    switch(option) {
      case 'attendance':
        // Navigate to attendance screen
        console.log('Navigate to attendance')
        break
      case 'sahsiah':
        // Navigate to sahsiah screen
        console.log('Navigate to sahsiah')
        break
      case 'rmt':
        // Navigate to rmt screen
        console.log('Navigate to rmt')
        break
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedOption(null)
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {scannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Scanned Data:</Text>
          <Text style={styles.resultText}>{scannedData}</Text>
          {!isScanning && (
            <Text style={styles.cooldownText}>Scanning will resume in 3 seconds...</Text>
          )}
        </View>
      )}
      
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
      </View>
      
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Text style={styles.flipButtonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Options Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Action</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('attendance')}
              >
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                <Text style={styles.optionText}>Attendance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('sahsiah')}
              >
                <Ionicons name="school" size={32} color="#2196F3" />
                <Text style={styles.optionText}>Sahsiah</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('rmt')}
              >
                <Ionicons name="restaurant" size={32} color="#FF9800" />
                <Text style={styles.optionText}>RMT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  camera: {
    flex: 1,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    color: 'white',
    fontSize: 14,
  },
  cooldownText: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
});