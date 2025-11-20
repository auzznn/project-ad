// Test script to verify the scanner flow implementation
// This simulates the QR data format expected by the new scanner

// Test QR data in JSON format
const testStudentQR = JSON.stringify({
  "student_id": "S12345",
  "name": "John Doe",
  "program": "Computer Science",
  "eligible_rmt": true,
  "timestamp": "2025-11-20T12:00:00Z"
});

// Test QR data in legacy format
const testLegacyQR = "STD:S12345:John Doe:CS:A1";

console.log("Test QR Data (JSON format):");
console.log(testStudentQR);
console.log("\nTest QR Data (Legacy format):");
console.log(testLegacyQR);

// Test parsing function
const parseStudentQR = (qrData) => {
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
    // Fallback to old format: STD:id:name:grade:class
    if (qrData.startsWith('STD:')) {
      const parts = qrData.split(':');
      if (parts.length === 5) {
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

// Test parsing
console.log("\nParsed JSON QR:");
console.log(parseStudentQR(testStudentQR));

console.log("\nParsed Legacy QR:");
console.log(parseStudentQR(testLegacyQR));

console.log("\nInvalid QR:");
console.log(parseStudentQR("INVALID_QR_CODE"));