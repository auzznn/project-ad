import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Alert, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

// Define discipline categories and violations
const disciplineCategories = [
  {
    id: 'academic',
    name: 'Academic Misconduct',
    icon: 'school',
    color: '#F44336',
    violations: [
      { id: 'late_homework', name: 'Late Homework Submission', points: 3 },
      { id: 'no_homework', name: 'Not Completing Homework', points: 5 },
      { id: 'disruptive', name: 'Disruptive Behavior in Class', points: 4 },
      { id: 'cheating', name: 'Cheating Attempt', points: 10 }
    ]
  },
  {
    id: 'behavior',
    name: 'Behavioral Issues',
    icon: 'warning',
    color: '#FF5722',
    violations: [
      { id: 'disrespect', name: 'Disrespect to Teachers', points: 6 },
      { id: 'bullying', name: 'Bullying Classmates', points: 8 },
      { id: 'lying', name: 'Lying', points: 5 },
      { id: 'fighting', name: 'Fighting', points: 10 }
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance Problems',
    icon: 'time',
    color: '#FF9800',
    violations: [
      { id: 'late', name: 'Late to Class', points: 2 },
      { id: 'unauthorized_absence', name: 'Unauthorized Absence', points: 5 },
      { id: 'frequent_absence', name: 'Frequent Absences', points: 7 },
      { id: 'leaving_early', name: 'Leaving Class Early', points: 3 }
    ]
  },
  {
    id: 'conduct',
    name: 'School Conduct',
    icon: 'business',
    color: '#795548',
    violations: [
      { id: 'dress_code', name: 'Dress Code Violation', points: 2 },
      { id: 'property_damage', name: 'School Property Damage', points: 8 },
      { id: 'prohibited_items', name: 'Bringing Prohibited Items', points: 6 },
      { id: 'vandalism', name: 'Vandalism', points: 9 }
    ]
  }
];

interface DisciplineFormProps {
  student: Student;
  onSubmit: (violationType: string, notes: string, points: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function DisciplineForm({ student, onSubmit, onCancel, loading = false }: DisciplineFormProps) {
  const { theme } = useTheme();
  
  // Theme colors using the hook
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const dangerColor = '#F44336';
  
  console.log('DisciplineForm component - rendering for student:', student.name);
  
  const [showViolationCategories, setShowViolationCategories] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<{ category: any; violation: any } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notes, setNotes] = useState('');
  const [recording, setRecording] = useState(false);

  const toggleCategory = (categoryId: string) => {
    console.log('DisciplineForm - Toggling category:', categoryId);
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const selectViolation = (category: any, violation: any) => {
    console.log('DisciplineForm - Selected violation:', violation.name, 'from category:', category.name);
    setSelectedViolation({ category, violation });
    console.log('DisciplineForm - Setting showConfirmation to true');
    setShowConfirmation(true);
  };

  /**
   * Confirms and submits the selected discipline violation
   * This is the final step in the DisciplineForm data flow
   *
   * Data Flow:
   * 1. User selects a violation from categories
   * 2. User confirms the violation with optional notes
   * 3. This function calls onSubmit with violation details and points
   * 4. Parent component (scanner.tsx) handles the actual storage and updates
   *
   * By passing points to the parent component, we ensure that all point
   * calculations and storage are centralized, preventing data inconsistencies
   *
   * @returns Promise<void> - Resolves when the violation is successfully recorded
   */
  const confirmViolation = async () => {
    if (!selectedViolation) return;
    
    setRecording(true);
    try {
      // Record the discipline violation with points deduction - pass points to parent component
      // This ensures the parent component (scanner.tsx) handles all point calculations
      // and storage, maintaining data consistency across the application
      await onSubmit(selectedViolation.violation.id, notes, -selectedViolation.violation.points);
      
      // Show success message to user
      Alert.alert(
        'Discipline Issue Recorded!',
        `${selectedViolation.violation.name} has been recorded for ${student.name}. -${selectedViolation.violation.points} points deducted.`,
        [{ text: 'OK', onPress: () => {
          // Reset form state after successful submission
          setShowConfirmation(false);
          setShowViolationCategories(false);
          setSelectedViolation(null);
          setNotes('');
          // Call onCancel to return to previous screen
          onCancel();
        }}]
      );
    } catch (error) {
      console.error('Error recording discipline violation:', error);
      Alert.alert('Error', 'Failed to record discipline violation. Please try again.');
    } finally {
      setRecording(false);
    }
  };

  /**
   * DATA FLOW ARCHITECTURE NOTES
   *
   * Previous Implementation Issues:
   * - Point updates were handled in both DisciplineForm and scanner.tsx
   * - This caused data inconsistencies and race conditions
   * - Leaderboard sometimes showed stale or incorrect data
   *
   * Current Implementation (Fixed):
   * - All point calculations and storage are centralized in scanner.tsx
   * - DisciplineForm only passes violation information and points to parent
   * - Scanner component handles:
   *   * Student point updates (total and daily)
   *   * Today's violations list updates
   *   * Class statistics updates
   *   * Discipline record storage
   *
   * Benefits:
   * - Single source of truth for point calculations
   * - Consistent data flow: Scanner → AsyncStorage → Leaderboard
   * - No duplicate or conflicting updates
   * - Leaderboard automatically reflects latest data
   *
   * Storage Keys Used:
   * - discipline_{studentId}_{date}_{timestamp}: Individual discipline records
   * - student_points_{studentId}: Student's total and daily points
   * - today_violations_{date}: List of all violations recorded today
   * - class_stats_{class}_{date}: Class-level statistics
   */

  const renderCategoryItem = ({ item }: { item: any }) => (
    <View style={[styles.categoryContainer, { backgroundColor: cardColor }]}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={20} color="white" />
          </View>
          <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
        </View>
        <View style={styles.categoryRight}>
          <Ionicons 
            name={expandedCategory === item.id ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={mutedColor} 
          />
        </View>
      </TouchableOpacity>
      
      {expandedCategory === item.id && (
        <View style={styles.violationsContainer}>
          {item.violations.map((violation: any) => (
            <TouchableOpacity
              key={violation.id}
              style={[styles.violationItem, { backgroundColor: backgroundColor, borderColor }]}
              onPress={() => selectViolation(item, violation)}
              activeOpacity={0.8}
            >
              <View style={styles.violationLeft}>
                <Text style={[styles.violationName, { color: textColor }]}>{violation.name}</Text>
                <Text style={[styles.violationPoints, { color: dangerColor }]}>-{violation.points} points</Text>
              </View>
              <View style={styles.violationRight}>
                <Ionicons name="chevron-forward" size={14} color={mutedColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (showConfirmation && selectedViolation) {
    console.log('DisciplineForm - Showing confirmation overlay');
    return (
      <View style={styles.confirmationOverlay}>
        <TouchableOpacity
          style={styles.confirmationBackdrop}
          activeOpacity={1}
          onPress={() => {
            console.log('DisciplineForm - Confirmation closed via backdrop');
            setShowConfirmation(false);
            setSelectedViolation(null);
            setNotes('');
          }}
        />
        <View style={[styles.confirmationModal, { backgroundColor: backgroundColor }]}>
          <View style={styles.confirmationHeader}>
            <Text style={[styles.confirmationTitle, { color: textColor }]}>Confirm Discipline Issue</Text>
            <TouchableOpacity onPress={() => {
              console.log('DisciplineForm - Confirmation closed via close button');
              setShowConfirmation(false);
              setSelectedViolation(null);
              setNotes('');
            }}>
              <Ionicons name="close" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.confirmationContent, { backgroundColor: cardColor }]}>
            <View style={styles.confirmationStudentInfo}>
              <Text style={[styles.confirmationStudent, { color: textColor }]}>{student.name}</Text>
              <Text style={[styles.confirmationClass, { color: mutedColor }]}>{student.program}</Text>
            </View>
            
            <View style={styles.confirmationViolationInfo}>
              <View style={[styles.confirmationCategory, { backgroundColor: selectedViolation.category.color }]}>
                <Ionicons name={selectedViolation.category.icon as any} size={16} color="white" />
                <Text style={styles.confirmationCategoryText}>{selectedViolation.category.name}</Text>
              </View>
              
              <Text style={[styles.confirmationViolationName, { color: textColor }]}>{selectedViolation.violation.name}</Text>
              <Text style={[styles.confirmationPoints, { color: dangerColor }]}>-{selectedViolation.violation.points} points</Text>
            </View>
            
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: textColor }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.notesInput, {
                  color: textColor,
                  backgroundColor: backgroundColor,
                  borderColor: borderColor
                }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor={mutedColor}
                multiline
                numberOfLines={3}
                editable={!recording}
              />
            </View>
          </View>
          
          <View style={styles.confirmationActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: borderColor }]}
              onPress={() => {
                console.log('DisciplineForm - Confirmation closed via cancel button');
                setShowConfirmation(false);
                setSelectedViolation(null);
                setNotes('');
              }}
              disabled={recording}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: dangerColor, opacity: recording ? 0.6 : 1 }]}
              onPress={confirmViolation}
              disabled={recording}
            >
              {recording ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  console.log('DisciplineForm - Rendering main form for student:', student.name);
  
  // Create data array for FlatList that includes header, student info, and categories
  const formData = [
    { type: 'header' },
    { type: 'studentInfo' },
    { type: 'sectionTitle' },
    ...disciplineCategories.map(category => ({ type: 'category', data: category }))
  ];

  const renderFormItem = ({ item, index }: { item: any; index: number }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: cardColor }]} onPress={onCancel}>
              <Ionicons name="arrow-back" size={20} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColor }]}>Record Discipline Issue</Text>
            <View style={styles.placeholder} />
          </View>
        );
      
      case 'studentInfo':
        return (
          <View style={[styles.studentInfo, { backgroundColor: cardColor }]}>
            <View style={styles.studentInfoContent}>
              <View style={[styles.avatar, { backgroundColor: dangerColor }]}>
                <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: textColor }]}>{student.name}</Text>
                <Text style={[styles.studentId, { color: mutedColor }]}>{student.id}</Text>
                <Text style={[styles.studentProgram, { color: mutedColor }]}>{student.program}</Text>
              </View>
            </View>
          </View>
        );
      
      case 'sectionTitle':
        return (
          <View style={styles.categoriesContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Select a Discipline Category</Text>
          </View>
        );
      
      case 'category':
        return renderCategoryItem({ item: item.data });
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={formData}
        renderItem={renderFormItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formList}
        ListHeaderComponent={<View style={{ height: 60 }} />}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  studentInfo: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  studentInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentProgram: {
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  formList: {
    paddingHorizontal: 20,
  },
  categoryContainer: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryRight: {
    padding: 8,
  },
  violationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  violationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  violationLeft: {
    flex: 1,
  },
  violationName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  violationPoints: {
    fontSize: 13,
    fontWeight: '600',
  },
  violationRight: {
    padding: 8,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  confirmationModal: {
    borderRadius: 20,
    padding: 24,
    width: screenWidth * 0.9,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  confirmationContent: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  confirmationStudentInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationStudent: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmationClass: {
    fontSize: 14,
  },
  confirmationViolationInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  confirmationCategoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  confirmationViolationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  confirmationPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});