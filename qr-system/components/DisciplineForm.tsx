import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Alert, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Student, studentApi, DisciplineType, DisciplineCategory } from '../api/studentApi';
import { useTheme } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

// Default category configurations
const categoryConfig: { [key: string]: { name: string; icon: string; color: string } } = {
  'Academic Misconduct': { name: 'Academic Misconduct', icon: 'school', color: '#F44336' },
  'Behavioral Issues': { name: 'Behavioral Issues', icon: 'warning', color: '#FF5722' },
  'Attendance Problems': { name: 'Attendance Problems', icon: 'time', color: '#FF9800' },
  'School Conduct': { name: 'School Conduct', icon: 'business', color: '#795548' },
  'other': { name: 'Lain-lain', icon: 'ellipsis-horizontal', color: '#607D8B' }
};

// Helper function to group discipline types by tag
const groupDisciplineByTag = (disciplineTypes: DisciplineType[]): DisciplineCategory[] => {
  const grouped: { [key: string]: DisciplineType[] } = {};
  
  // Group by tag
  disciplineTypes.forEach(type => {
    if (!grouped[type.tag]) {
      grouped[type.tag] = [];
    }
    grouped[type.tag].push(type);
  });
  
  // Convert to category format
  return Object.keys(grouped).map(tag => {
    const config = categoryConfig[tag] || categoryConfig['other'];
    return {
      tag,
      name: config.name,
      icon: config.icon,
      color: config.color,
      types: grouped[tag]
    };
  });
};

interface DisciplineFormProps {
  student: Student;
  onSubmit: (disciplineType: number, notes: string) => Promise<void>;
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
  const [disciplineCategories, setDisciplineCategories] = useState<DisciplineCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch discipline types on component mount
  useEffect(() => {
    const fetchDisciplineTypes = async () => {
      try {
        setLoadingCategories(true);
        const types = await studentApi.getDisciplineTypes();
        const categories = groupDisciplineByTag(types);
        setDisciplineCategories(categories);
      } catch (error) {
        // Fallback to empty array if API fails
        setDisciplineCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchDisciplineTypes();
  }, []);

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
      // Convert violation ID string to number for API compatibility
      const disciplineTypeId = parseInt(selectedViolation.violation.id, 10);
      await onSubmit(disciplineTypeId, notes);
      
      // Show success message to user
      Alert.alert(
        'Discipline Issue Recorded!',
        `${selectedViolation.violation.name} has been recorded for ${student.name}. ${selectedViolation.violation.points} points deducted.`,
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

  const renderCategoryItem = ({ item }: { item: DisciplineCategory }) => (
    <View style={[styles.categoryContainer, { backgroundColor: cardColor }]}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(item.tag)}
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
            name={expandedCategory === item.tag ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={mutedColor}
          />
        </View>
      </TouchableOpacity>
      
      {expandedCategory === item.tag && (
        <View style={styles.violationsContainer}>
          {item.types.map((type: DisciplineType) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.violationItem, { backgroundColor: backgroundColor, borderColor }]}
              onPress={() => selectViolation(item, type)}
              activeOpacity={0.8}
            >
              <View style={styles.violationLeft}>
                <Text style={[styles.violationName, { color: textColor }]}>{type.name}</Text>
                <Text style={[styles.violationPoints, { color: dangerColor }]}>{type.points} points</Text>
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
  
  // Show loading state while fetching categories
  if (loadingCategories) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: cardColor }]} onPress={onCancel}>
            <Ionicons name="arrow-back" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Record Discipline Issue</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dangerColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading discipline categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('DisciplineForm - Rendering main form for student:', student.name);
  
  // Create data array for FlatList that only includes categories
  const formData = disciplineCategories.map(category => ({ type: 'category', data: category }));

  const renderFormItem = ({ item }: { item: any }) => {
    return renderCategoryItem({ item: item.data });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: cardColor }]} onPress={onCancel}>
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Record Discipline Issue</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Student Info - Static */}
      <View style={[styles.studentInfo, { backgroundColor: cardColor }]}>
        <View style={styles.studentInfoContent}>
          <View style={[styles.avatar, { backgroundColor: dangerColor }]}>
            <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: textColor }]}>{student.name}</Text>
          </View>
        </View>
      </View>
      
      {/* Section Title - Static */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Select a Discipline Category</Text>
      </View>
      
      {/* Scrollable List - Categories Only */}
      <FlatList
        data={formData}
        renderItem={renderFormItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formList}
        ListFooterComponent={<View style={{ height: 20 }} />}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 20,
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
    padding: 16,
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
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  formList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryContainer: {
    borderRadius: 16,
    marginBottom: 12,
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
    padding: 16,
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  violationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});