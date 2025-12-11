import React from "react";
import { View, StyleSheet } from "react-native";
import StudentModal from "./StudentModal";
import SahsiahForm from "./SahsiahForm";
import DisciplineForm from "./DisciplineForm";
import { Student } from "../api/studentApi";
import { StudentActions } from "../hooks/useStudentActions";
import { LoadingStates } from "../hooks/useStudentData";

interface ModalManagerProps {
  student: Student | null;
  actions: StudentActions;
  loading: LoadingStates;
  allActionsCompleted: boolean;
  sahsiahCount: number;
  disciplineCount: number;
  showStudentModal: boolean;
  showSahsiahForm: boolean;
  showDisciplineForm: boolean;
  onClose: () => void;
  onAttendance: (student: Student) => void;
  onRMT: (student: Student) => void;
  onSahsiah: (student: Student, sahsiahType: number, notes: string) => Promise<boolean>;
  onDiscipline: (student: Student, violationType: string, notes: string, points?: number) => Promise<boolean>;
  onOpenSahsiahForm: () => void;
  onOpenDisciplineForm: () => void;
  onBackFromSahsiah: () => void;
  onBackFromDiscipline: () => void;
  onFormSubmit: () => void;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  student,
  actions,
  loading,
  allActionsCompleted,
  sahsiahCount,
  disciplineCount,
  showStudentModal,
  showSahsiahForm,
  showDisciplineForm,
  onClose,
  onAttendance,
  onRMT,
  onSahsiah,
  onDiscipline,
  onOpenSahsiahForm,
  onOpenDisciplineForm,
  onBackFromSahsiah,
  onBackFromDiscipline,
  onFormSubmit,
}) => {
  if (!student) return null;

  return (
    <>
      {/* Student Modal */}
      <StudentModal
        visible={showStudentModal}
        student={student}
        actions={actions}
        loading={loading}
        allActionsCompleted={allActionsCompleted}
        sahsiahCount={sahsiahCount}
        disciplineCount={disciplineCount}
        onClose={onClose}
        onAttendance={() => onAttendance(student)}
        onRMT={() => onRMT(student)}
        onSahsiah={async (deedType: string, notes: string, points?: number) => {
          await onSahsiah(student, parseInt(deedType), notes);
        }}
        onDiscipline={async (violationType: string, notes: string, points?: number) => {
          await onDiscipline(student, violationType, notes, points);
        }}
        onOpenSahsiahForm={onOpenSahsiahForm}
        onOpenDisciplineForm={onOpenDisciplineForm}
      />

      {/* Sahsiah Form as a separate overlay */}
      {showSahsiahForm && (
        <View style={styles.formOverlay}>
          <SahsiahForm
            student={student}
            onSubmit={async (deedType, notes, points) => {
              const success = await onSahsiah(student, (deedType), notes);
              if (success) {
                onFormSubmit();
              }
            }}
            onCancel={onBackFromSahsiah}
            loading={loading.sahsiah}
          />
        </View>
      )}

      {/* Discipline Form as a separate overlay */}
      {showDisciplineForm && (
        <View style={styles.formOverlay}>
          <DisciplineForm
            student={student}
            onSubmit={async (violationType: string, notes: string, points?: number) => {
              await onDiscipline(student, violationType, notes, points);
            }}
            onCancel={onBackFromDiscipline}
            loading={loading.discipline}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  formOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 1000,
  },
});

export default ModalManager;