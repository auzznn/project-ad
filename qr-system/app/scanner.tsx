import { Button, View, Text, StyleSheet, Vibration, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native'
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ScannedItem {
  id: string;
  data: string;
  timestamp: Date;
  studentInfo?: StudentInfo | null;
}

interface StudentInfo {
  id: string;
  name: string;
  grade: string;
  class: string;
}

export default function scanner() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(true)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastScannedTime, setLastScannedTime] = useState<number>(0)
  const [mode, setMode] = useState<'attendance' | 'rmt' | 'sahsiah'>('attendance')

  const parseStudentQR = (qrData: string): StudentInfo | null => {
    // Parse student QR format: STD:id:name:grade:class
    if (qrData.startsWith('STD:')) {
      const parts = qrData.split(':');
      if (parts.length === 5) {
        return {
          id: parts[1],
          name: parts[2],
          grade: parts[3],
          class: parts[4]
        };
      }
    }
    return null;
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) {
      // Prevent duplicate scans within 1 second
      const now = Date.now()
      if (now - lastScannedTime < 1000) {
        return
      }
      
      // Vibrate to indicate successful scan
      Vibration.vibrate(100)
      
      // Check if this QR code was already scanned
      const isDuplicate = scannedItems.some(item => item.data === data)
      
      if (!isDuplicate) {
        const studentInfo = parseStudentQR(data);
        const newItem: ScannedItem = {
          id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
          data,
          timestamp: new Date(),
          studentInfo
        }
        
        setScannedItems(prev => [...prev, newItem])
        
        // Different behavior based on current mode
        switch(mode) {
          case 'attendance':
            console.log('Attendance mode: Scanned student for attendance', studentInfo)
            break
          case 'rmt':
            console.log('RMT mode: Scanned student for RMT', studentInfo)
            break
          case 'sahsiah':
            console.log('Sahsiah mode: Scanned student for sahsiah', studentInfo)
            break
        }
      }
      
      setLastScannedTime(now)
      
      // Brief pause to prevent immediate re-scanning
      setIsScanning(false)
      setTimeout(() => {
        setIsScanning(true)
      }, 500)
    }
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setShowActionModal(false)
    // Process all scanned items with the selected action
    console.log(`Processing ${scannedItems.length} items for ${option}`)
    
    // Navigate based on selected option
    switch(option) {
      case 'attendance':
        // Process all items for attendance
        console.log('Process attendance for:', scannedItems)
        break
      case 'sahsiah':
        // Process all items for sahsiah
        console.log('Process sahsiah for:', scannedItems)
        break
      case 'rmt':
        // Process all items for RMT
        console.log('Process RMT for:', scannedItems)
        break
    }
    
    // Clear scanned items after processing
    setScannedItems([])
  }

  const closeActionModal = () => {
    setShowActionModal(false)
    setSelectedOption(null)
  }

  const clearScannedItems = () => {
    setScannedItems([])
  }

  const removeScannedItem = (id: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== id))
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
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
      
      {/* Scanned Items List */}
      {scannedItems.length > 0 && (
        <View style={styles.scannedItemsContainer}>
          <View style={styles.scannedItemsHeader}>
            <Text style={styles.scannedItemsTitle}>
              Scanned Items ({scannedItems.length})
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearScannedItems}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scannedItemsList}
          >
            {scannedItems.map((item) => (
              <View key={item.id} style={styles.scannedItem}>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeScannedItem(item.id)}
                >
                  <Ionicons name="close-circle" size={16} color="#FF5252" />
                </TouchableOpacity>
                {item.studentInfo ? (
                  <View style={styles.studentInfoContainer}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {item.studentInfo.name}
                    </Text>
                    <Text style={styles.studentDetails} numberOfLines={1}>
                      {item.studentInfo.grade} • {item.studentInfo.class}
                    </Text>
                    <Text style={styles.studentId}>
                      ID: {item.studentInfo.id}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.scannedItemText} numberOfLines={2}>
                      {item.data}
                    </Text>
                    <Text style={styles.scannedItemTime}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.continueScanningButton}
              onPress={() => setIsScanning(true)}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.continueScanningText}>Continue Scanning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.processItemsButton}
              onPress={() => setShowActionModal(true)}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="white" />
              <Text style={styles.processItemsText}>Process Items</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        {scannedItems.length === 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Scan QR codes to add items</Text>
          </View>
        )}
      </View>
      
      {/* Mode Selection Buttons */}
      <SafeAreaView style={styles.modeButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'attendance' && styles.activeModeButton
          ]}
          onPress={() => setMode('attendance')}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={mode === 'attendance' ? '#fff' : '#4CAF50'}
          />
          <Text style={[
            styles.modeButtonText,
            mode === 'attendance' && styles.activeModeButtonText
          ]}>
            Attendance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'rmt' && styles.activeModeButton
          ]}
          onPress={() => setMode('rmt')}
        >
          <Ionicons
            name="restaurant"
            size={24}
            color={mode === 'rmt' ? '#fff' : '#FF9800'}
          />
          <Text style={[
            styles.modeButtonText,
            mode === 'rmt' && styles.activeModeButtonText
          ]}>
            RMT
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'sahsiah' && styles.activeModeButton
          ]}
          onPress={() => setMode('sahsiah')}
        >
          <Ionicons
            name="school"
            size={24}
            color={mode === 'sahsiah' ? '#fff' : '#2196F3'}
          />
          <Text style={[
            styles.modeButtonText,
            mode === 'sahsiah' && styles.activeModeButtonText
          ]}>
            Sahsiah
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Action Options Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeActionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Action for {scannedItems.length} Items
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeActionModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannedItemsPreview}>
              <Text style={styles.previewTitle}>Items to process:</Text>
              <FlatList
                data={scannedItems}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={styles.previewItem}>
                    <Text style={styles.previewIndex}>{index + 1}.</Text>
                    {item.studentInfo ? (
                      <View style={styles.previewStudentInfo}>
                        <Text style={styles.previewStudentName}>
                          {item.studentInfo.name}
                        </Text>
                        <Text style={styles.previewStudentDetails}>
                          {item.studentInfo.grade} • {item.studentInfo.class}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.previewData} numberOfLines={1}>
                        {item.data}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('attendance')}
              >
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                <Text style={styles.optionText}>Mark Attendance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('sahsiah')}
              >
                <Ionicons name="school" size={32} color="#2196F3" />
                <Text style={styles.optionText}>Record Sahsiah</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOptionSelect('rmt')}
              >
                <Ionicons name="restaurant" size={32} color="#FF9800" />
                <Text style={styles.optionText}>Process RMT</Text>
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
  hintContainer: {
    position: 'absolute',
    bottom: 320,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
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
  scannedItemsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
    maxHeight: 200,
  },
  scannedItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scannedItemsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 5,
  },
  scannedItemsList: {
    maxHeight: 80,
    marginBottom: 10,
  },
  scannedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    minWidth: 150,
    maxWidth: 150,
    position: 'relative',
  },
  removeItemButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  scannedItemText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  scannedItemTime: {
    color: '#cccccc',
    fontSize: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  continueScanningButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueScanningText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  processItemsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  processItemsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
  scannedItemsPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    maxHeight: 150,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  previewIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    minWidth: 20,
  },
  previewData: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  studentInfoContainer: {
    flex: 1,
  },
  studentName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentDetails: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 2,
  },
  studentId: {
    color: '#999999',
    fontSize: 10,
  },
  previewStudentInfo: {
    flex: 1,
  },
  previewStudentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  previewStudentDetails: {
    fontSize: 12,
    color: '#666',
  },
  modeButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeModeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderColor: 'rgba(76, 175, 80, 0.8)',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  activeModeButtonText: {
    color: 'white',
  },
});