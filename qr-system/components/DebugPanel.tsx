import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStudentData } from '../hooks/useStudentData';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const { clearAllAttendanceData } = useStudentData();

  const handleClearData = () => {
    Alert.alert(
      "Clear Attendance Data",
      "This will clear all locally stored attendance data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            clearAllAttendanceData();
            onClose();
          }
        }
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>Debug Options</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>Clear Local Attendance Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.closeButton]} 
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});