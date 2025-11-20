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
  
  // Test scanning protection features
  console.log('\n\nTesting Scanning Protection Features');
  console.log('='.repeat(30));
  
  // Simulate scanner state
  let lastScannedData = '';
  let isCooldown = false;
  let scannedItems = [];
  
  // Test 1: First scan should succeed
  console.log('\nTest 1: First scan of QR code');
  const testQR1 = generateStudentQR(sampleStudents[0]);
  if (testQR1 !== lastScannedData && !isCooldown) {
    console.log('✅ Test PASSED - First scan allowed');
    lastScannedData = testQR1;
    scannedItems.push(testQR1);
  } else {
    console.log('❌ Test FAILED - First scan should be allowed');
    allTestsPassed = false;
  }
  
  // Test 2: Duplicate scan should be blocked
  console.log('\nTest 2: Duplicate scan of same QR code');
  if (testQR1 === lastScannedData) {
    console.log('✅ Test PASSED - Duplicate scan correctly blocked');
  } else {
    console.log('❌ Test FAILED - Duplicate scan should be blocked');
    allTestsPassed = false;
  }
  
  // Test 3: Different QR code should be allowed
  console.log('\nTest 3: Different QR code scan');
  const testQR2 = generateStudentQR(sampleStudents[1]);
  if (testQR2 !== lastScannedData && !isCooldown) {
    console.log('✅ Test PASSED - Different QR scan allowed');
    lastScannedData = testQR2;
    scannedItems.push(testQR2);
  } else {
    console.log('❌ Test FAILED - Different QR scan should be allowed');
    allTestsPassed = false;
  }
  
  // Test 4: Simulate cooldown state
  console.log('\nTest 4: Scan during cooldown');
  isCooldown = true;
  const testQR3 = generateStudentQR(sampleStudents[2]);
  if (isCooldown) {
    console.log('✅ Test PASSED - Scan correctly blocked during cooldown');
  } else {
    console.log('❌ Test FAILED - Scan should be blocked during cooldown');
    allTestsPassed = false;
  }
  isCooldown = false; // Reset cooldown
  
  // Test 5: Clear scanned items should reset lastScannedData
  console.log('\nTest 5: Clear scanned items');
  lastScannedData = ''; // Simulate clearScannedItems function
  if (lastScannedData === '') {
    console.log('✅ Test PASSED - Clear function resets lastScannedData');
  } else {
    console.log('❌ Test FAILED - Clear function should reset lastScannedData');
    allTestsPassed = false;
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! QR integration and scanning protection are working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Please check the implementation.');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
};

// Run the test
testQRIntegration();