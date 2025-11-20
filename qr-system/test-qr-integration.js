// Test script to verify QR code generation and parsing integration
// This simulates the QR code generation from qr-generator.tsx and parsing from scanner.tsx

// Sample student data from qr-generator.tsx
const sampleStudents = [
  { id: '2023001', name: 'Ahmad bin Iskandar', grade: 'Grade 5', class: 'Class A' },
  { id: '2023002', name: 'Siti Nurhaliza', grade: 'Grade 6', class: 'Class B' },
  { id: '2023003', name: 'Muhammad Rafi', grade: 'Grade 4', class: 'Class A' },
  { id: '2023004', name: 'Nurul Aini', grade: 'Grade 5', class: 'Class C' },
  { id: '2023005', name: 'Zulkifli bin Hassan', grade: 'Grade 6', class: 'Class A' },
];

// QR code generation function from qr-generator.tsx
const generateStudentQR = (student) => {
  return `STD:${student.id}:${student.name}:${student.grade}:${student.class}`;
};

// QR code parsing function from scanner.tsx
const parseStudentQR = (qrData) => {
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

// Test function
const testQRIntegration = () => {
  console.log('Testing QR Code Generation and Parsing Integration\n');
  console.log('='.repeat(50));
  
  let allTestsPassed = true;
  
  sampleStudents.forEach((student, index) => {
    console.log(`\nTest ${index + 1}: ${student.name}`);
    console.log('-'.repeat(30));
    
    // Generate QR code
    const qrCode = generateStudentQR(student);
    console.log(`Generated QR: ${qrCode}`);
    
    // Parse QR code
    const parsedStudent = parseStudentQR(qrCode);
    console.log(`Parsed Student:`, parsedStudent);
    
    // Verify the parsed data matches the original
    const isMatch = parsedStudent && 
                   parsedStudent.id === student.id && 
                   parsedStudent.name === student.name && 
                   parsedStudent.grade === student.grade && 
                   parsedStudent.class === student.class;
    
    if (isMatch) {
      console.log('✅ Test PASSED');
    } else {
      console.log('❌ Test FAILED');
      allTestsPassed = false;
    }
  });
  
  // Test with invalid QR codes
  console.log('\n\nTesting Invalid QR Codes');
  console.log('='.repeat(30));
  
  const invalidQRCodes = [
    'INVALID:123:John:Doe:Grade 5:Class A',  // Wrong prefix
    'STD:123:John:Doe',                        // Missing parts
    'STD:123:John:Doe:Grade 5:Class A:Extra',  // Too many parts
    'JUSTSOMERANDOMTEXT',                      // Completely invalid
    ''                                          // Empty string
  ];
  
  invalidQRCodes.forEach((qrCode, index) => {
    console.log(`\nInvalid Test ${index + 1}: "${qrCode}"`);
    const parsedStudent = parseStudentQR(qrCode);
    
    if (parsedStudent === null) {
      console.log('✅ Test PASSED - Correctly rejected invalid QR');
    } else {
      console.log('❌ Test FAILED - Should have rejected invalid QR');
      allTestsPassed = false;
    }
  });
  
  // Summary
  console.log('\n\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! QR integration is working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Please check the implementation.');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
};

// Run the test
testQRIntegration();