import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Alert, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

// Define good deed categories and deeds
const goodDeedCategories = [
  {
    id: 'academic',
    name: 'Academic Excellence',
    icon: 'school',
    color: '#4CAF50',
    deeds: [
      { id: 'homework', name: 'Completing Homework', points: 5 },
      { id: 'participation', name: 'Active Participation', points: 3 },
      { id: 'helping', name: 'Helping Classmates', points: 4 },
      { id: 'excellence', name: 'Excellent Test Score', points: 10 }
    ]
  },
  {
    id: 'behavior',
    name: 'Good Behavior',
    icon: 'heart',
    color: '#2196F3',
    deeds: [
      { id: 'honesty', name: 'Honesty', points: 8 },
      { id: 'respect', name: 'Respect to Teachers', points: 5 },
      { id: 'kindness', name: 'Kindness to Others', points: 4 },
      { id: 'discipline', name: 'Self Discipline', points: 6 }
    ]
  },
  {
    id: 'leadership',
    name: 'Leadership',
    icon: 'star',
    color: '#FF9800',
    deeds: [
      { id: 'leading', name: 'Leading Group Activity', points: 7 },
      { id: 'responsibility', name: 'Taking Responsibility', points: 6 },
      { id: 'initiative', name: 'Showing Initiative', points: 8 },
      { id: 'mentoring', name: 'Mentoring Younger Students', points: 10 }
    ]
  },
  {
    id: 'service',
    name: 'Community Service',
    icon: 'people',
    color: '#9C27B0',
    deeds: [
      { id: 'cleaning', name: 'Classroom Cleaning', points: 3 },
      { id: 'organizing', name: 'Organizing School Event', points: 8 },
      { id: 'volunteering', name: 'Volunteering', points: 7 },
      { id: 'fundraising', name: 'Fundraising', points: 9 }
    ]
  }
];

interface SahsiahFormProps {
  student: Student;
  onSubmit: (deedType: string, notes: string, points: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function SahsiahForm({ student, onSubmit, onCancel, loading = false }: SahsiahFormProps) {
  const { theme } = useTheme();
  
  // Theme colors using the hook
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');
  const successColor = useThemeColor('success');
  
  console.log('SahsiahForm component - rendering for student:', student.name);
  
  const [showDeedCategories, setShowDeedCategories] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDeed, setSelectedDeed] = useState<{ category: any; deed: any } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notes, setNotes] = useState('');
  const [recording, setRecording] = useState(false);

  const toggleCategory = (categoryId: string) => {
    console.log('SahsiahForm - Toggling category:', categoryId);
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const selectDeed = (category: any, deed: any) => {
    console.log('SahsiahForm - Selected deed:', deed.name, 'from category:', category.name);
    setSelectedDeed({ category, deed });
    console.log('SahsiahForm - Setting showConfirmation to true');
    setShowConfirmation(true);
  };

  /**
   * Confirms and submits the selected good deed
   * This is the final step in the SahsiahForm data flow
   *
   * Data Flow:
   * 1. User selects a good deed from categories
   * 2. User confirms the deed with optional notes
   * 3. This function calls onSubmit with deed details and points
   * 4. Parent component (scanner.tsx) handles the actual storage and updates
   *
   * By passing points to the parent component, we ensure that all point
   * calculations and storage are centralized, preventing data inconsistencies
   *
   * @returns Promise<void> - Resolves when the deed is successfully recorded
   */
  const confirmDeed = async () => {
    if (!selectedDeed) return;
    
    setRecording(true);
    try {
      // Record the good deed with points - pass points to parent component
      // This ensures the parent component (scanner.tsx) handles all point calculations
      // and storage, maintaining data consistency across the application
      await onSubmit(selectedDeed.deed.id, notes, selectedDeed.deed.points);
      
      // Show success message to user
      Alert.alert(
        'Good Deed Recorded!',
        `${selectedDeed.deed.name} has been recorded for ${student.name}. +${selectedDeed.deed.points} points awarded.`,
        [{ text: 'OK', onPress: () => {
          // Reset form state after successful submission
          setShowConfirmation(false);
          setShowDeedCategories(false);
          setSelectedDeed(null);
          setNotes('');
          // Call onCancel to return to previous screen
          onCancel();
        }}]
      );
    } catch (error) {
      console.error('Error recording good deed:', error);
      Alert.alert('Error', 'Failed to record good deed. Please try again.');
    } finally {
      setRecording(false);
    }
  };

  /**
   * DATA FLOW ARCHITECTURE NOTES
   *
   * Previous Implementation Issues:
   * - Point updates were handled in both SahsiahForm and scanner.tsx
   * - This caused data inconsistencies and race conditions
   * - Leaderboard sometimes showed stale or incorrect data
   *
   * Current Implementation (Fixed):
   * - All point calculations and storage are centralized in scanner.tsx
   * - SahsiahForm only passes deed information and points to parent
   * - Scanner component handles:
   *   * Student point updates (total and daily)
   *   * Today's deeds list updates
   *   * Class statistics updates
   *   * Sahsiah record storage
   *
   * Benefits:
   * - Single source of truth for point calculations
   * - Consistent data flow: Scanner → AsyncStorage → Leaderboard
   * - No duplicate or conflicting updates
   * - Leaderboard automatically reflects latest data
   *
   * Storage Keys Used:
   * - sahsiah_{studentId}_{date}_{timestamp}: Individual good deed records
   * - student_points_{studentId}: Student's total and daily points
   * - today_deeds_{date}: List of all deeds performed today
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
        <View style={styles.deedsContainer}>
          {item.deeds.map((deed: any) => (
            <TouchableOpacity
              key={deed.id}
              style={[styles.deedItem, { backgroundColor: backgroundColor, borderColor }]}
              onPress={() => selectDeed(item, deed)}
              activeOpacity={0.8}
            >
              <View style={styles.deedLeft}>
                <Text style={[styles.deedName, { color: textColor }]}>{deed.name}</Text>
                <Text style={[styles.deedPoints, { color: primaryColor }]}>+{deed.points} points</Text>
              </View>
              <View style={styles.deedRight}>
                <Ionicons name="chevron-forward" size={14} color={mutedColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (showConfirmation && selectedDeed) {
    console.log('SahsiahForm - Showing confirmation overlay');
    return (
      <View style={styles.confirmationOverlay}>
        <TouchableOpacity
          style={styles.confirmationBackdrop}
          activeOpacity={1}
          onPress={() => {
            console.log('SahsiahForm - Confirmation closed via backdrop');
            setShowConfirmation(false);
            setSelectedDeed(null);
            setNotes('');
          }}
        />
        <View style={[styles.confirmationModal, { backgroundColor: backgroundColor }]}>
          <View style={styles.confirmationHeader}>
            <Text style={[styles.confirmationTitle, { color: textColor }]}>Confirm Good Deed</Text>
            <TouchableOpacity onPress={() => {
              console.log('SahsiahForm - Confirmation closed via close button');
              setShowConfirmation(false);
              setSelectedDeed(null);
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
            
            <View style={styles.confirmationDeedInfo}>
              <View style={[styles.confirmationCategory, { backgroundColor: selectedDeed.category.color }]}>
                <Ionicons name={selectedDeed.category.icon as any} size={16} color="white" />
                <Text style={styles.confirmationCategoryText}>{selectedDeed.category.name}</Text>
              </View>
              
              <Text style={[styles.confirmationDeedName, { color: textColor }]}>{selectedDeed.deed.name}</Text>
              <Text style={[styles.confirmationPoints, { color: primaryColor }]}>+{selectedDeed.deed.points} points</Text>
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
                console.log('SahsiahForm - Confirmation closed via cancel button');
                setShowConfirmation(false);
                setSelectedDeed(null);
                setNotes('');
              }}
              disabled={recording}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: primaryColor, opacity: recording ? 0.6 : 1 }]}
              onPress={confirmDeed}
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

  console.log('SahsiahForm - Rendering main form for student:', student.name);
  
  // Create data array for FlatList that includes header, student info, and categories
  const formData = [
    { type: 'header' },
    { type: 'studentInfo' },
    { type: 'sectionTitle' },
    ...goodDeedCategories.map(category => ({ type: 'category', data: category }))
  ];

  const renderFormItem = ({ item, index }: { item: any; index: number }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: cardColor }]} onPress={onCancel}>
              <Ionicons name="arrow-back" size={20} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColor }]}>Record Good Deed</Text>
            <View style={styles.placeholder} />
          </View>
        );
      
      case 'studentInfo':
        return (
          <View style={[styles.studentInfo, { backgroundColor: cardColor }]}>
            <View style={styles.studentInfoContent}>
              <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: textColor }]}>{student.name}</Text>
                <Text style={[styles.studentId, { color: mutedColor }]}>{student.student_id}</Text>
                <Text style={[styles.studentProgram, { color: mutedColor }]}>{student.program}</Text>
              </View>
            </View>
          </View>
        );
      
      case 'sectionTitle':
        return (
          <View style={styles.categoriesContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Select a Good Deed Category</Text>
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
  deedsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  deedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  deedLeft: {
    flex: 1,
  },
  deedName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  deedPoints: {
    fontSize: 13,
    fontWeight: '600',
  },
  deedRight: {
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
  confirmationDeedInfo: {
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
  confirmationDeedName: {
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