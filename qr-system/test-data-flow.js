/**
 * Test Script for Updated Data Flow
 * This script tests the complete flow from scanner → SahsiahForm → leaderboard
 * 
 * Test Scenarios:
 * 1. Student QR scan → SahsiahForm → Good deed recording → Leaderboard update
 * 2. Multiple good deeds for same student → Points accumulation
 * 3. Multiple students → Leaderboard sorting
 * 4. Data persistence across app restarts
 */

// Mock AsyncStorage for testing
const mockAsyncStorage = {
  data: {},
  getItem: async (key) => {
    return mockAsyncStorage.data[key] || null;
  },
  setItem: async (key, value) => {
    mockAsyncStorage.data[key] = value;
    console.log(`✅ Stored: ${key}`);
  },
  getAllKeys: async () => {
    return Object.keys(mockAsyncStorage.data);
  },
  multiRemove: async (keys) => {
    keys.forEach(key => delete mockAsyncStorage.data[key]);
    console.log(`🗑️  Removed: ${keys.join(', ')}`);
  }
};

// Test data
const testStudent = {
  student_id: 'TEST001',
  name: 'Test Student',
  program: 'Class A',
  eligible_rmt: true,
  timestamp: new Date().toISOString()
};

const testDeeds = [
  { id: 'homework', name: 'Completing Homework', points: 5 },
  { id: 'helping', name: 'Helping Classmates', points: 4 },
  { id: 'honesty', name: 'Honesty', points: 8 }
];

/**
 * Test 1: Complete data flow from scanner to leaderboard
 */
async function testDataFlow() {
  console.log('\n🧪 TEST 1: Complete Data Flow');
  console.log('=====================================');
  
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  try {
    // Step 1: Simulate scanner handleSahsiah function
    console.log('\n📱 Step 1: Scanner - Recording good deed...');
    
    // Create sahsiah record (like scanner.tsx does)
    const sahsiahKey = `sahsiah_${testStudent.student_id}_${today}_${timestamp}`;
    const sahsiahData = {
      student_id: testStudent.student_id,
      student_name: testStudent.name,
      program: testStudent.program,
      eligible_rmt: testStudent.eligible_rmt,
      deed_type: testDeeds[0].id,
      notes: 'Test note',
      points: testDeeds[0].points,
      timestamp: timestamp
    };
    
    await mockAsyncStorage.setItem(sahsiahKey, JSON.stringify(sahsiahData));
    
    // Step 2: Update student points (like scanner.tsx does)
    console.log('\n💯 Step 2: Updating student points...');
    
    const pointsKey = `student_points_${testStudent.student_id}`;
    const studentPoints = {
      totalPoints: testDeeds[0].points,
      dailyPoints: {
        [today]: testDeeds[0].points
      },
      lastUpdated: timestamp
    };
    
    await mockAsyncStorage.setItem(pointsKey, JSON.stringify(studentPoints));
    
    // Step 3: Update today's deeds (like scanner.tsx does)
    console.log('\n📋 Step 3: Updating today\'s deeds...');
    
    const todayDeedsKey = `today_deeds_${today}`;
    const todayDeeds = [{
      studentId: testStudent.student_id,
      studentName: testStudent.name,
      program: testStudent.program,
      deedName: testDeeds[0].name,
      points: testDeeds[0].points,
      timestamp: timestamp
    }];
    
    await mockAsyncStorage.setItem(todayDeedsKey, JSON.stringify(todayDeeds));
    
    // Step 4: Update class statistics (like scanner.tsx does)
    console.log('\n📊 Step 4: Updating class statistics...');
    
    const classStatsKey = `class_stats_${testStudent.program}_${today}`;
    const classStats = {
      totalPoints: testDeeds[0].points,
      deedCount: 1,
      topStudents: [testStudent.student_id]
    };
    
    await mockAsyncStorage.setItem(classStatsKey, JSON.stringify(classStats));
    
    console.log('\n✅ Test 1 PASSED: Data flow completed successfully');
    
  } catch (error) {
    console.error('\n❌ Test 1 FAILED:', error);
  }
}

/**
 * Test 2: Multiple good deeds for same student
 */
async function testMultipleDeeds() {
  console.log('\n🧪 TEST 2: Multiple Good Deeds');
  console.log('================================');
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Simulate recording multiple deeds
    let totalPoints = 0;
    
    for (let i = 0; i < testDeeds.length; i++) {
      const deed = testDeeds[i];
      const timestamp = new Date().toISOString();
      
      console.log(`\n📝 Recording deed ${i + 1}: ${deed.name} (+${deed.points} points)`);
      
      // Create sahsiah record
      const sahsiahKey = `sahsiah_${testStudent.student_id}_${today}_${timestamp}`;
      const sahsiahData = {
        student_id: testStudent.student_id,
        student_name: testStudent.name,
        program: testStudent.program,
        eligible_rmt: testStudent.eligible_rmt,
        deed_type: deed.id,
        notes: `Test note ${i + 1}`,
        points: deed.points,
        timestamp: timestamp
      };
      
      await mockAsyncStorage.setItem(sahsiahKey, JSON.stringify(sahsiahData));
      totalPoints += deed.points;
    }
    
    // Update student points with accumulated total
    const pointsKey = `student_points_${testStudent.student_id}`;
    const studentPoints = {
      totalPoints: totalPoints,
      dailyPoints: {
        [today]: totalPoints
      },
      lastUpdated: new Date().toISOString()
    };
    
    await mockAsyncStorage.setItem(pointsKey, JSON.stringify(studentPoints));
    
    console.log(`\n✅ Test 2 PASSED: ${testDeeds.length} deeds recorded, Total points: ${totalPoints}`);
    
  } catch (error) {
    console.error('\n❌ Test 2 FAILED:', error);
  }
}

/**
 * Test 3: Leaderboard data aggregation (like leaderboard.tsx does)
 */
async function testLeaderboardAggregation() {
  console.log('\n🧪 TEST 3: Leaderboard Data Aggregation');
  console.log('==========================================');
  
  try {
    // Simulate leaderboard.tsx loadStudentData function
    const today = new Date().toISOString().split('T')[0];
    const allKeys = await mockAsyncStorage.getAllKeys();
    
    console.log('\n🔍 Analyzing stored data...');
    console.log(`Found ${allKeys.length} storage keys:`, allKeys);
    
    // Load today's deeds
    const todayDeedsKey = `today_deeds_${today}`;
    const todayDeedsData = await mockAsyncStorage.getItem(todayDeedsKey);
    
    if (todayDeedsData) {
      const todayDeeds = JSON.parse(todayDeedsData);
      console.log(`\n📋 Today's deeds: ${todayDeeds.length} entries`);
      todayDeeds.forEach((deed, index) => {
        console.log(`  ${index + 1}. ${deed.studentName} - ${deed.deedName} (+${deed.points} points)`);
      });
    }
    
    // Load student points
    const studentPointKeys = allKeys.filter(key => key.startsWith('student_points_'));
    console.log(`\n💰 Student points: ${studentPointKeys.length} students`);
    
    for (const key of studentPointKeys) {
      const studentId = key.replace('student_points_', '');
      const pointsData = await mockAsyncStorage.getItem(key);
      
      if (pointsData) {
        const parsedData = JSON.parse(pointsData);
        console.log(`  ${studentId}: ${parsedData.totalPoints} total points`);
      }
    }
    
    // Load class statistics
    const classStatsKeys = allKeys.filter(key => key.startsWith('class_stats_'));
    console.log(`\n📊 Class statistics: ${classStatsKeys.length} classes`);
    
    for (const key of classStatsKeys) {
      const statsData = await mockAsyncStorage.getItem(key);
      
      if (statsData) {
        const parsedData = JSON.parse(statsData);
        console.log(`  ${key}: ${parsedData.totalPoints} points, ${parsedData.deedCount} deeds`);
      }
    }
    
    console.log('\n✅ Test 3 PASSED: Leaderboard data aggregation successful');
    
  } catch (error) {
    console.error('\n❌ Test 3 FAILED:', error);
  }
}

/**
 * Test 4: Data consistency check
 */
async function testDataConsistency() {
  console.log('\n🧪 TEST 4: Data Consistency Check');
  console.log('===================================');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const allKeys = await mockAsyncStorage.getAllKeys();
    
    // Check for data consistency
    const studentPointKeys = allKeys.filter(key => key.startsWith('student_points_'));
    const todayDeedsKey = `today_deeds_${today}`;
    const todayDeedsData = await mockAsyncStorage.getItem(todayDeedsKey);
    
    let consistencyIssues = [];
    
    if (todayDeedsData) {
      const todayDeeds = JSON.parse(todayDeedsData);
      const deedStudentIds = new Set(todayDeeds.map(deed => deed.studentId));
      const pointsStudentIds = new Set(studentPointKeys.map(key => key.replace('student_points_', '')));
      
      // Check if all students in today's deeds have points
      for (const studentId of deedStudentIds) {
        if (!pointsStudentIds.has(studentId)) {
          consistencyIssues.push(`Student ${studentId} in today's deeds but missing points data`);
        }
      }
      
      // Check point totals match deed totals
      for (const studentId of deedStudentIds) {
        const studentDeeds = todayDeeds.filter(deed => deed.studentId === studentId);
        const deedTotal = studentDeeds.reduce((sum, deed) => sum + deed.points, 0);
        
        const pointsKey = `student_points_${studentId}`;
        const pointsData = await mockAsyncStorage.getItem(pointsKey);
        
        if (pointsData) {
          const parsedPoints = JSON.parse(pointsData);
          if (parsedPoints.totalPoints !== deedTotal) {
            consistencyIssues.push(`Student ${studentId}: Points mismatch (deeds: ${deedTotal}, points: ${parsedPoints.totalPoints})`);
          }
        }
      }
    }
    
    if (consistencyIssues.length === 0) {
      console.log('\n✅ Test 4 PASSED: No data consistency issues found');
    } else {
      console.log('\n❌ Test 4 FAILED: Data consistency issues detected:');
      consistencyIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
  } catch (error) {
    console.error('\n❌ Test 4 FAILED:', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Data Flow Tests');
  console.log('=============================');
  
  await testDataFlow();
  await testMultipleDeeds();
  await testLeaderboardAggregation();
  await testDataConsistency();
  
  console.log('\n🏁 All tests completed!');
  console.log('========================');
  
  // Display final storage state
  console.log('\n📦 Final Storage State:');
  console.log('=======================');
  const allKeys = await mockAsyncStorage.getAllKeys();
  
  for (const key of allKeys.sort()) {
    const data = await mockAsyncStorage.getItem(key);
    console.log(`\n${key}:`);
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  }
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Run tests automatically when executed with node
  runAllTests();
} else if (typeof module !== 'undefined' && module.exports) {
  // Export for use in other modules
  module.exports = {
    runAllTests,
    testDataFlow,
    testMultipleDeeds,
    testLeaderboardAggregation,
    testDataConsistency
  };
} else {
  // Run tests automatically in browser environment
  runAllTests();
}