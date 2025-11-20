import { apiRequest } from './axiosClient';

export interface Student {
  student_id: string;
  name: string;
  program: string;
  eligible_rmt: boolean;
  timestamp?: string;
  points?: number;
}

export interface AttendanceRecord {
  student_id: string;
  timestamp: string;
}

export interface SahsiahRecord {
  student_id: string;
  deed_type: string;
  notes?: string;
  timestamp: string;
}

export const studentApi = {
  // Mark attendance for a student
  markAttendance: async (studentId: string): Promise<any> => {
    return apiRequest.post('/attendance/mark', { student_id: studentId });
  },
  
  // Record sahsiah (behavior/conduct) for a student
  recordSahsiah: async (data: SahsiahRecord): Promise<any> => {
    return apiRequest.post('/sahsiah/record', data);
  },
  
  // Check RMT eligibility (though this will be determined from QR data)
  checkRMTEligibility: async (studentId: string): Promise<any> => {
    return apiRequest.get(`/rmt/check/${studentId}`);
  },
  
  // Reset all sahsiah data
  resetSahsiah: async (): Promise<any> => {
    return apiRequest.post('/sahsiah/reset');
  }
};