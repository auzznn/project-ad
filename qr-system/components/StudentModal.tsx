import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../api/studentApi';
import ActionButton from './ActionButton';
import { useTheme } from '../context/ThemeContext';

interface StudentModalProps {
  visible: boolean;
  student: Student | null;
  actions: {
    attendance: boolean;
    rmt: boolean;
    sahsiah: boolean;
    discipline: boolean;
  };
  loading: {
    attendance: boolean;
    rmt: boolean;
    sahsiah: boolean;
    discipline: boolean;
  };
  allActionsCompleted?: boolean;
  sahsiahCount?: number;
  disciplineCount?: number;
  onClose: () => void;
  onAttendance: () => void;
  onRMT: () => void;
  onSahsiah: (sahsiahTypeId: number, notes: string) => Promise<void>;
  onDiscipline: (violationType: string, notes: string) => Promise<void>;
  onOpenSahsiahForm: () => void;
  onOpenDisciplineForm: () => void;
}

export default function StudentModal({
  visible,
  student,
  actions,
  loading,
  allActionsCompleted = false,
  sahsiahCount = 0,
  disciplineCount = 0,
  onClose,
  onAttendance,
  onRMT,
  onSahsiah,
  onDiscipline,
  onOpenSahsiahForm,
  onOpenDisciplineForm
}: StudentModalProps) {
  const { theme } = useTheme();
  
  if (!student) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Student Information</Text>
            {allActionsCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.completedText}>All actions completed</Text>
              </View>
            )}
            {sahsiahCount > 0 && (
              <View style={styles.sahsiahBadge}>
                <Ionicons name="star" size={16} color="#9C27B0" />
                <Text style={styles.sahsiahText}>{sahsiahCount} deed{sahsiahCount > 1 ? 's' : ''} recorded</Text>
              </View>
            )}
            {disciplineCount > 0 && (
              <View style={styles.disciplineBadge}>
                <Ionicons name="warning" size={16} color="#F44336" />
                <Text style={styles.disciplineText}>{disciplineCount} issue{disciplineCount > 1 ? 's' : ''} recorded</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.muted} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.studentInfoContainer, { backgroundColor: theme.card }]}>
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>👤</Text>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>Name</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>🎓</Text>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>Student ID</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.student_id}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>🏫</Text>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>Class</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.class}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>🍽</Text>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>RMT Eligible</Text>
              <Text style={[
                styles.infoValue,
                { color: student.rmt_elligible ? '#4CAF50' : '#F44336' }
              ]}>
                {student.rmt_elligible ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <ActionButton
              title="Take Attendance"
              icon="checkmark-circle"
              color="#4CAF50"
              onPress={onAttendance}
              disabled={loading.attendance}
              loading={loading.attendance}
              completed={actions.attendance}
            />
            
            {student.rmt_elligible && (
              <ActionButton
                title="Record RMT"
                icon="restaurant"
                color="#FF9800"
                onPress={onRMT}
                disabled={loading.rmt}
                loading={loading.rmt}
                completed={actions.rmt}
              />
            )}
            
            <ActionButton
              title="Record Good Deed"
              icon="star"
              color="#9C27B0"
              onPress={onOpenSahsiahForm}
              disabled={loading.sahsiah}
              loading={loading.sahsiah}
              completed={false}
            />
            
            <ActionButton
              title="Record Discipline Issue"
              icon="warning"
              color="#F44336"
              onPress={onOpenDisciplineForm}
              disabled={loading.discipline}
              loading={loading.discipline}
              completed={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 100,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 101,
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 102,
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
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 5,
  },
  sahsiahBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  sahsiahText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
    marginLeft: 5,
  },
  disciplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  disciplineText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 5,
  },
  closeButton: {
    padding: 8,
  },
  studentInfoContainer: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 0.3,
  },
  infoValue: {
    fontSize: 16,
    flex: 0.7,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 15,
  },
});