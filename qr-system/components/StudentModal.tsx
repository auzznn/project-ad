import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Student, studentApi } from '../api/studentApi';
import ActionButton from './ActionButton';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

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
  onSahsiah: (deedType: string, notes: string, points?: number) => Promise<void>;
  onDiscipline: (disciplineType: number, notes: string) => Promise<void>;
  onOpenSahsiahForm: () => void;
  onOpenDisciplineForm: () => void;
  onAttendanceSuccess?: () => void; // New callback for successful attendance
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
  onOpenDisciplineForm,
  onAttendanceSuccess
}: StudentModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [canMarkAttendance, setCanMarkAttendance] = useState(true);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  
  // Check attendance status when modal opens or student changes
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!student || !visible) return;
      
      setCheckingAttendance(true);
      try {
        const record = await studentApi.checkAttendanceStatus(student.id);
        
        // Enable button only if no record exists or status is "absent"
        const canMark = !record || record.status === "absent";
        setCanMarkAttendance(canMark);
      } catch (error) {
        // Default to enabling button if there's an error
        setCanMarkAttendance(true);
      } finally {
        setCheckingAttendance(false);
      }
    };
    
    checkAttendanceStatus();
  }, [student, visible]);
  
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
          <Text style={[styles.modalTitle, { color: theme.text }]}>{t('studentDetails')}</Text>
            {allActionsCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                <Text style={[styles.completedText, { color: theme.success }]}>{t('allActionsCompleted')}</Text>
              </View>
            )}
            {sahsiahCount > 0 && (
              <View style={styles.sahsiahBadge}>
                <Ionicons name="star" size={16} color={theme.primary} />
                <Text style={[styles.sahsiahText, { color: theme.primary }]}>{sahsiahCount} {t('sahsiah')} {sahsiahCount > 1 ? t('recorded') + 's' : t('recorded')}</Text>
              </View>
            )}
            {disciplineCount > 0 && (
              <View style={styles.disciplineBadge}>
                <Ionicons name="warning" size={16} color={theme.error} />
                <Text style={[styles.disciplineText, { color: theme.error }]}>{disciplineCount} {t('discipline')} {disciplineCount > 1 ? 'issue' + 's' : 'issue'} {t('recorded')}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.muted} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.studentInfoContainer, { backgroundColor: theme.card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('fullName')}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>Student ID</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.id}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('class')}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.class}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>RMT {t('eligible')}</Text>
              <Text style={[
                styles.infoValue,
                { color: student.rmt_elligible ? theme.success : theme.error }
              ]}>
                {student.rmt_elligible ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <ActionButton
              title={t('takeAttendance')}
              icon="checkmark-circle"
              color={!canMarkAttendance ? theme.muted : theme.success}
              onPress={async () => {
                await onAttendance();
                // After successful attendance, set canMarkAttendance to false
                setCanMarkAttendance(false);
              }}
              disabled={loading.attendance || !canMarkAttendance || checkingAttendance}
              loading={loading.attendance || checkingAttendance}
              completed={actions.attendance}
            />
            
            {student.rmt_elligible && (
              <ActionButton
                title={t('recordRMT')}
                icon="restaurant"
                color={theme.accent}
                onPress={onRMT}
                disabled={loading.rmt}
                loading={loading.rmt}
                completed={actions.rmt}
              />
            )}
            
            <ActionButton
              title={t('recordGoodDeed')}
              icon="star"
              color={theme.primary}
              onPress={onOpenSahsiahForm}
              disabled={loading.sahsiah}
              loading={loading.sahsiah}
              completed={false}
            />
            
            <ActionButton
              title={t('recordDisciplineIssue')}
              icon="warning"
              color={theme.error}
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  sahsiahBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  sahsiahText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  disciplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  disciplineText: {
    fontSize: 12,
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