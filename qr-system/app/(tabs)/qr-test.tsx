import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

// Sample student data for QR generation
const sampleStudents = [
  { id: '2023001', name: 'Ahmad bin Iskandar', grade: '5', class: 'Class A', eligible_rmt: true },
  { id: '2023002', name: 'Siti Nurhaliza', grade: '6', class: 'Class B', eligible_rmt: false },
  { id: '2023003', name: 'Muhammad Rafi', grade: '4', class: 'Class A', eligible_rmt: true },
  { id: '2023004', name: 'Nurul Aini', grade: '5', class: 'Class C', eligible_rmt: false },
  { id: '2023005', name: 'Zulkifli bin Hassan', grade: '6', class: 'Class A', eligible_rmt: true },
];

// Student QR code format that supports all three modules
const generateStudentQR = (student: typeof sampleStudents[0]) => {
  return `STD:${student.id}:${student.name}:${student.grade}:${student.class}:${student.eligible_rmt}`;
};

export default function QRTest() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [qrValue, setQrValue] = useState('');
  
  // Theme colors
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const successColor = useThemeColor('success');

  const generateQR = () => {
    const student = sampleStudents[selectedStudent];
    const qrData = generateStudentQR(student);
    setQrValue(qrData);
  };

  const selectStudent = (index: number) => {
    setSelectedStudent(index);
    const student = sampleStudents[index];
    const qrData = generateStudentQR(student);
    setQrValue(qrData);
  };

  const navigateToScanner = () => {
    if (qrValue) {
      Alert.alert(
        'Test Instructions',
        'Navigate to the Scanner tab and scan the QR code shown below. The scanner should correctly identify the student information.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Scanner', 
            onPress: () => router.push('/scanner')
          }
        ]
      );
    } else {
      Alert.alert('No QR Code', 'Please generate a QR code first.');
    }
  };

  const clearData = () => {
    setQrValue('');
  };

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-5 pt-5 pb-6">
          <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
            QR Code Test Suite
          </Text>
          <Text className="text-base" style={{ color: mutedColor }}>
            Test QR generation and scanning functionality
          </Text>
        </View>

        {/* Student Selection */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
            Select Student for Testing
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sampleStudents.map((student, index) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => selectStudent(index)}
                className={`px-4 py-3 rounded-xl mr-3 border ${
                  selectedStudent === index ? 'border-2' : 'border'
                }`}
                style={{
                  backgroundColor: selectedStudent === index ? primaryColor : cardColor,
                  borderColor: selectedStudent === index ? primaryColor : borderColor,
                  minWidth: 120
                }}
              >
                <Text
                  className="text-sm font-medium text-center"
                  style={{
                    color: selectedStudent === index ? 'white' : textColor
                  }}
                >
                  {student.name}
                </Text>
                <Text
                  className="text-xs text-center mt-1"
                  style={{
                    color: selectedStudent === index ? 'rgba(255,255,255,0.8)' : mutedColor
                  }}
                >
                  {student.grade} • {student.class}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* QR Code Info */}
        <View className="px-5 mb-6">
          <View 
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <View className="flex-row items-start mb-3">
              <Ionicons name="information-circle" size={20} color={primaryColor} style={{ marginRight: 8 }} />
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                  Student: {sampleStudents[selectedStudent].name}
                </Text>
                <Text className="text-xs mb-1" style={{ color: mutedColor }}>
                  ID: {sampleStudents[selectedStudent].id}
                </Text>
                <Text className="text-xs mb-1" style={{ color: mutedColor }}>
                  Grade: {sampleStudents[selectedStudent].grade}
                </Text>
                <Text className="text-xs" style={{ color: mutedColor }}>
                  Class: {sampleStudents[selectedStudent].class}
                </Text>
                <Text className="text-xs" style={{ color: mutedColor }}>
                  RMT Eligible: {sampleStudents[selectedStudent].eligible_rmt ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            
            <View className="border-t pt-3 mt-3" style={{ borderColor }}>
              <Text className="text-sm font-semibold mb-2" style={{ color: textColor }}>
                QR Code Format:
              </Text>
              <Text className="text-xs font-mono bg-gray-100 p-2 rounded" style={{ color: textColor }}>
                STD:id:name:grade:class:eligible_rmt
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mb-6 flex-row space-x-3">
          <TouchableOpacity
            onPress={generateQR}
            className="flex-1 py-4 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Generate QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={clearData}
            className="flex-1 py-4 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: borderColor }}
          >
            <Ionicons name="trash" size={20} color={textColor} />
            <Text className="font-semibold ml-2" style={{ color: textColor }}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        {qrValue && (
          <View className="px-5 mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: textColor }}>
              Generated QR Code
            </Text>
            <View 
              className="rounded-2xl p-6 items-center border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <View className="bg-white p-4 rounded-xl mb-4">
                <QRCode
                  value={qrValue}
                  size={200}
                  color="black"
                  backgroundColor="white"
                />
              </View>
              <Text className="text-xs text-center px-4 mb-4" style={{ color: mutedColor }}>
                {qrValue.length > 50 ? `${qrValue.substring(0, 50)}...` : qrValue}
              </Text>
              
              <TouchableOpacity
                onPress={navigateToScanner}
                className="w-full py-3 rounded-xl flex-row items-center justify-center"
                style={{ backgroundColor: successColor }}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Test with Scanner</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Test Instructions */}
        <View className="px-5 mb-6">
          <View 
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="flask" size={20} color={primaryColor} style={{ marginRight: 8 }} />
              <Text className="text-base font-semibold" style={{ color: textColor }}>
                Test Instructions
              </Text>
            </View>
            <Text className="text-sm mb-2" style={{ color: mutedColor }}>
              1. Select a student from the list above
            </Text>
            <Text className="text-sm mb-2" style={{ color: mutedColor }}>
              2. Tap "Generate QR" to create their unique QR code
            </Text>
            <Text className="text-sm mb-2" style={{ color: mutedColor }}>
              3. Tap "Test with Scanner" to navigate to the scanner
            </Text>
            <Text className="text-sm mb-2" style={{ color: mutedColor }}>
              4. Scan the generated QR code with the scanner
            </Text>
            <Text className="text-sm" style={{ color: mutedColor }}>
              5. Verify that the scanner correctly parses the student information
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}